import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
}

export interface UserPayload {
  email: string;
  id: number;
  tenantId: number;
  role: string;
  firstName?: string;
  lastName?: string;
  tenant?: Tenant;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as unknown as UserPayload;
    }
    return null;
  }

  login(user: UserPayload) {
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

  async register(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Check if tenant exists or create one
    let tenant: Tenant | null;
    if (data.tenantId) {
      tenant = await this.prisma.tenant.findUnique({
        where: { id: data.tenantId },
      });
    } else {
      tenant = await this.prisma.tenant.create({
        data: {
          name: data.tenantName || 'Default Tenant',
          subdomain: data.subdomain || `tenant-${Date.now()}`,
        },
      });
    }

    if (!tenant) {
      throw new ConflictException('Tenant not found');
    }

    try {
      const user = await this.prisma.user.create({
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as unknown as UserPayload;
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2002') {
        throw new ConflictException('Email or subdomain already exists');
      }
      throw error;
    }
  }
}
