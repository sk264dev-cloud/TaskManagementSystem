# =========================
# Build stage
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy project files first
# This allows Docker to cache NuGet restore
COPY TMS.API/TMS.API.csproj TMS.API/
COPY TMS.Application/TMS.Application.csproj TMS.Application/
COPY TMS.Infrastructure/TMS.Infrastructure.csproj TMS.Infrastructure/
COPY TMS.Domain/TMS.Domain.csproj TMS.Domain/

# Restore dependencies
RUN dotnet restore TMS.API/TMS.API.csproj

# Copy source code
COPY TMS.API/ TMS.API/
COPY TMS.Application/ TMS.Application/
COPY TMS.Infrastructure/ TMS.Infrastructure/
COPY TMS.Domain/ TMS.Domain/

# Publish API
RUN dotnet publish TMS.API/TMS.API.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


# =========================
# Runtime stage
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Render's default web service port
ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "TMS.API.dll"]
