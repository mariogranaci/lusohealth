# LusoHealth

LusoHealth é uma plataforma de saúde digital desenvolvida como projeto académico de ESA e PV, com foco na gestão de utilizadores, marcações, comunicação em tempo real e funcionalidades de suporte clínico.

## Estrutura do projeto

- `LusoHealth/LusoHealthClient/LusoHealthClient.Server` — backend e API em ASP.NET Core
- `LusoHealth/LusoHealthClient/lusohealthclient.client` — frontend SPA em Angular
- `LusoHealth/LusoHealthTests` e `LusoHealth/TestLusoHealth` — suites de testes automatizados

## Tecnologias utilizadas

### Backend
- .NET 8 / ASP.NET Core Web API
- Entity Framework Core (com SQL Server e migrations)
- ASP.NET Core Identity e autenticação JWT
- SignalR / Azure SignalR para comunicação em tempo real
- Swagger (Swashbuckle) para documentação e testes da API

### Frontend
- Angular 17 + TypeScript
- Angular Material e Bootstrap/Bootswatch
- RxJS
- Chart.js
- FullCalendar
- Google Maps APIs

### Qualidade e testes
- xUnit
- Moq
- Coverlet (cobertura)

## Metodologia adotada

O projeto segue uma abordagem **cliente-servidor** com separação clara de responsabilidades entre frontend e backend.  
No backend, a organização em pastas (`Controllers`, `Services`, `Data`, `DTOs`, `Models`) reflete uma metodologia em camadas orientada à manutenção e escalabilidade.  
A evolução da base de dados é gerida com migrations do Entity Framework Core, e a validação funcional é suportada por testes automatizados.
