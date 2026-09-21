FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TMS.API.csproj", "TMS.API/"]
COPY ["../TMS.Domain/TMS.Domain.csproj", "TMS.Domain/"]
COPY ["../TMS.Application/TMS.Application.csproj", "TMS.Application/"]
COPY ["../TMS.Infrastructure/TMS.Infrastructure.csproj", "TMS.Infrastructure/"]
RUN dotnet restore "TMS.API/TMS.API.csproj"
COPY . ./TMS.API/
COPY ../TMS.Domain/ ./TMS.Domain/
COPY ../TMS.Application/ ./TMS.Application/
COPY ../TMS.Infrastructure/ ./TMS.Infrastructure/
RUN dotnet publish "TMS.API/TMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TMS.API.dll"]
