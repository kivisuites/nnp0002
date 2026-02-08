FROM postgres:15-alpine

# Set default environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=kivipassword
ENV POSTGRES_DB=kivisuites

# Expose the default Postgres port
EXPOSE 5432

# Use a volume for persistence
VOLUME /var/lib/postgresql/data

# Add a healthcheck to ensure the database is ready
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB
