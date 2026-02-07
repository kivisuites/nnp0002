import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: user.tenant,
      },
    };
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Check if tenant exists or create one
    let tenant: any;
    if (data.tenantId) {
      tenant = await (this.prisma as any).tenant.findUnique({
        where: { id: data.tenantId },
      });
    } else {
      tenant = await (this.prisma as any).tenant.create({
        data: {
          name: data.tenantName || 'Default Tenant',
          subdomain: data.subdomain || `tenant-${Date.now()}`,
        },
      });
    }

    try {
      const user = await (this.prisma as any).user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || 'USER',
          tenantId: tenant.id,
        },
        include: { tenant: true },
      });

      const { password, ...result } = user;
      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
}
