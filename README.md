# Microserviço de Pagamento - Fast Food Totem

### 📊 Quality Metrics

**Overall Code (Código Completo - Main Branch):**

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vinicius0012_11soat-fast-food-fase-4-api-payment&metric=alert_status)](https://sonarcloud.io/dashboard?id=vinicius0012_11soat-fast-food-fase-4-api-payment)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=vinicius0012_11soat-fast-food-fase-4-api-payment&metric=coverage)](https://sonarcloud.io/dashboard?id=vinicius0012_11soat-fast-food-fase-4-api-payment)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=vinicius0012_11soat-fast-food-fase-4-api-payment&metric=bugs)](https://sonarcloud.io/dashboard?id=vinicius0012_11soat-fast-food-fase-4-api-payment)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=vinicius0012_11soat-fast-food-fase-4-api-payment&metric=code_smells)](https://sonarcloud.io/dashboard?id=vinicius0012_11soat-fast-food-fase-4-api-payment)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=vinicius0012_11soat-fast-food-fase-4-api-payment&metric=security_rating)](https://sonarcloud.io/dashboard?id=vinicius0012_11soat-fast-food-fase-4-api-payment)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=vinicius0012_11soat-fast-food-fase-4-api-payment&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=vinicius0012_11soat-fast-food-fase-4-api-payment)

## 📋 Sobre o Projeto

O **Microserviço de Pagamento** é parte integrante do ecossistema Fast Food Totem, sendo responsável exclusivamente pelo processamento e gerenciamento de pagamentos através da integração com o **Mercado Pago**. Este serviço opera de forma independente, seguindo os princípios de arquitetura de microserviços.

## 🎯 Objetivos Principais

- **Processamento de Pagamentos**: Integração robusta com Mercado Pago para criação e gestão de transações
- **Geração de QR Code**: Criação de códigos QR para pagamento via PIX através do Mercado Pago
- **Monitoramento de Status**: Consulta em tempo real do status das transações de pagamento
- **Gestão de Webhooks**: Processamento automático de notificações do Mercado Pago
- **Rastreabilidade**: Vínculo entre pedidos e transações de pagamento através de referências externas

## 🏗️ Arquitetura

Este microserviço foi desenvolvido seguindo os princípios de **Clean Architecture** e **Hexagonal Architecture**, garantindo:

- **Separação de responsabilidades**: Domínio, aplicação e infraestrutura bem definidos
- **Independência de frameworks**: Lógica de negócio isolada de detalhes técnicos
- **Testabilidade**: Alta cobertura de testes unitários e de integração
- **Manutenibilidade**: Código organizado e de fácil evolução

### Stack Tecnológica

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: MongoDB
- **Gateway de Pagamento**: Mercado Pago API
- **Documentação**: Swagger/OpenAPI
- **Validação**: Class-validator
- **Autenticação**: JWT (JSON Web Tokens)

## 🚀 Funcionalidades

### 💳 Gestão de Pagamentos

- **Criar Pagamento**: Geração de nova transação com QR Code para pagamento via PIX
- **Consultar Status**: Verificação do status atual de uma transação pelo ID
- **Atualizar Status**: Atualização manual do status de pagamento
- **Cancelar Pagamento**: Cancelamento de transações com motivo opcional
- **Buscar Referência Externa**: Recuperação da referência do pedido através do ID da transação

### 🔔 Processamento de Webhooks

- Recebimento automático de notificações do Mercado Pago
- Validação de assinatura do webhook
- Processamento assíncrono de atualizações de status
- Registro de eventos para auditoria

## ⚙️ Configuração do Ambiente

Antes de executar o projeto, é necessário configurar as variáveis de ambiente:

Crie o arquivo .env na raiz do projeto
Copie o conteúdo do arquivo .env.example como base
Configure as variáveis de acordo com seu ambiente local

⚠️ **Importante**: 
- Obtenha suas credenciais do Mercado Pago em: https://www.mercadopago.com.br/developers
- O `WEBHOOK_URL` deve ser um endpoint público acessível pelo Mercado Pago
- Nunca compartilhe suas credenciais de produção

## 🐳 Executar com Docker Compose

Para facilitar o gerenciamento do projeto com Docker Compose, utilize os comandos abaixo:

```bash
# Subir todos os serviços em modo destacado (background)
docker-compose up -d

# Visualizar logs da aplicação
docker-compose logs -f app

# Visualizar logs do MongoDB
docker-compose logs -f db

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (limpar banco de dados)
docker-compose down -v
```

## 🛠️ Instalação e Configuração Local

### Pré-requisitos

- Node.js 18+ 
- NPM ou Yarn
- MongoDB 7.0+

### Instalação de Dependências

```bash
# Usando NPM
npm install

# Ou usando Yarn
yarn install
```

### Executar Localmente

```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev

# Modo produção
npm run build
npm run start:prod

# Modo debug
npm run start:debug
```

## 🧪 Testes

O projeto possui alta cobertura de testes seguindo as melhores práticas de TDD e Clean Architecture.

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Executar testes E2E
npm run test:e2e

# Debug de testes
npm run test:debug
```

### Cobertura de Testes

O projeto mantém uma cobertura de testes superior a **80%**, incluindo:

- ✅ Testes unitários de Use Cases
- ✅ Testes unitários de Controllers
- ✅ Testes unitários de Mappers e Presenters
- ✅ Testes unitários de Guards
- ✅ Testes de integração com MongoDB
- ✅ Testes E2E dos endpoints

## 🚀 Endpoints da API

Este microserviço expõe os seguintes endpoints para gerenciamento de pagamentos:

### 💳 Criação de Pagamento

**Endpoint**: `POST /payment/create`

Cria uma nova transação de pagamento e gera um QR Code para pagamento via PIX.

**Request Body**:
```json
{
  "amount": 100.50,
  "description": "Pagamento do Pedido #123",
  "orderId": "order_123",
  "callbackUrl": "https://seu-sistema.com/callback",
  "expirationMinutes": 30
}
```

**Response**:
```json
{
  "transactionId": "12345678",
  "qrCode": "https://mercadopago.com.br/...",
  "qrCodeBase64": "data:image/png;base64,...",
  "status": "pending",
  "amount": 100.50,
  "externalReference": "order_123"
}
```

### 📊 Consultar Status do Pagamento

**Endpoint**: `GET /payment/status/{transactionId}`

Retorna o status atual de uma transação de pagamento.

**Response**:
```json
{
  "transactionId": "12345678",
  "status": "approved",
  "statusDetail": "accredited",
  "amount": 100.50,
  "externalReference": "order_123"
}
```

**Possíveis Status**:
- `pending`: Pagamento pendente
- `approved`: Pagamento aprovado
- `authorized`: Pagamento autorizado
- `in_process`: Em processamento
- `in_mediation`: Em mediação
- `rejected`: Pagamento rejeitado
- `cancelled`: Pagamento cancelado
- `refunded`: Pagamento reembolsado
- `charged_back`: Estornado

### 🔄 Atualizar Status do Pagamento

**Endpoint**: `PATCH /payment/status/{transactionId}`

Atualiza manualmente o status de um pagamento consultando o Mercado Pago.

**Response**:
```json
{
  "message": "Pagamento atualizado com sucesso",
  "result": {
    "transactionId": "12345678",
    "status": "approved"
  }
}
```

### ❌ Cancelar Pagamento

**Endpoint**: `DELETE /payment/{transactionId}`

Cancela uma transação de pagamento.

**Query Parameters** (opcional):
- `reason`: Motivo do cancelamento

**Response**:
```json
{
  "message": "Pagamento cancelado com sucesso"
}
```

### 🔍 Buscar Referência Externa

**Endpoint**: `GET /payment/external-reference/{transactionId}`

Retorna a referência externa (orderId) vinculada a uma transação.

**Response**:
```json
{
  "transactionId": "12345678",
  "externalReference": "order_123"
}
```

### 🔔 Webhook do Mercado Pago

**Endpoint**: `POST /payment/webhook`

Endpoint para receber notificações automáticas do Mercado Pago sobre mudanças no status dos pagamentos.

⚠️ **Importante**: Este endpoint deve ser configurado no painel do Mercado Pago e possui validação de assinatura.

**Request Body** (exemplo):
```json
{
  "action": "payment.updated",
  "data": {
    "id": "12345678"
  }
}
```

**Response**:
```json
{
  "message": "Webhook processado com sucesso",
  "result": {
    "processed": true
  }
}
```

### 🏥 Health Check

**Endpoint**: `GET /health`

Verifica o status de saúde do serviço.

**Response**:
```json
{
  "status": "ok",
  "info": {
    "mongodb": {
      "status": "up"
    }
  }
}
```

## 📋 Documentação da API (Swagger)

A documentação completa da API está disponível via Swagger UI com interface interativa para teste dos endpoints.

### Como Acessar o Swagger

1. **Certifique-se de que o ambiente está configurado**:
   - Arquivo `.env` criado e configurado
   - Docker e Docker Compose instalados

2. **Inicie os serviços**:

```bash
docker-compose up -d
```

3. **Aguarde a inicialização completa**:
   - O MongoDB será inicializado
   - A aplicação estará disponível na porta **1337**

4. **Acesse a documentação**:

[➡️ http://localhost:1337/api-docs](http://localhost:1337/api-docs)

### Recursos Disponíveis no Swagger

- ✅ Teste de endpoints em tempo real
- ✅ Autenticação JWT integrada (clique em "Authorize" para inserir o token)
- ✅ Exemplos de requisições e respostas
- ✅ Esquemas de dados detalhados (DTOs)
- ✅ Códigos de status HTTP com descrições
- ✅ Validação de campos obrigatórios

### Testando a API

#### Fluxo Completo de Pagamento

1. **Criar Pagamento**:
   ```
   POST /payment/create
   ```
   - Informe o valor, descrição e ID do pedido
   - Receba o QR Code e ID da transação

2. **Consultar Status**:
   ```
   GET /payment/status/{transactionId}
   ```
   - Use o ID da transação recebido no passo anterior
   - Verifique o status atual do pagamento

3. **Simular Webhook** (em ambiente de testes):
   ```
   POST /payment/webhook
   ```
   - Simule notificações do Mercado Pago

4. **Cancelar se Necessário**:
   ```
   DELETE /payment/{transactionId}
   ```
   - Cancele pagamentos pendentes

💡 **Dica**: Em ambiente de desenvolvimento, você pode usar o [Webhook.site](https://webhook.site) para testar o recebimento de webhooks do Mercado Pago.

## 🏛️ Estrutura do Projeto

O projeto segue os princípios de **Clean Architecture** e está organizado da seguinte forma:

```
src/
├── application/
│   ├── controllers/          # Controladores HTTP
│   │   └── payment/
│   ├── domain/               # Entidades e regras de negócio
│   │   ├── dtos/            # Data Transfer Objects
│   │   ├── entities/        # Entidades do domínio
│   │   ├── errors/          # Erros customizados
│   │   └── value-objects/   # Objetos de valor
│   ├── ports/               # Interfaces (Portas)
│   │   ├── input/          # Casos de uso
│   │   └── output/         # Repositórios
│   ├── presenters/          # Formatadores de resposta
│   └── use-cases/           # Casos de uso (lógica de negócio)
│       └── payment/
├── infrastructure/          # Implementações técnicas
│   ├── database/           # Conexão e repositórios
│   │   └── mongo/
│   ├── gateways/           # Integrações externas
│   │   └── payment/        # Gateway Mercado Pago
│   ├── guards/             # Guardas de autenticação
│   └── shared/             # Utilitários compartilhados
├── modules/                # Módulos NestJS
│   ├── health/            # Health check
│   └── payment/           # Módulo de pagamento
├── app.module.ts          # Módulo principal
├── configuration.ts       # Configurações
└── main.ts               # Bootstrap da aplicação
```

### Camadas da Arquitetura

#### 🎯 Domain (Domínio)
- **Entidades**: Representam os conceitos principais do negócio (Payment)
- **Value Objects**: Objetos imutáveis que representam valores (PaymentStatus)
- **DTOs**: Contratos de dados entre camadas
- **Errors**: Exceções de domínio customizadas

#### 💼 Application (Aplicação)
- **Use Cases**: Implementam as regras de negócio
  - `CreatePaymentUseCase`: Criação de pagamentos
  - `GetPaymentStatusUseCase`: Consulta de status
  - `CancelPaymentUseCase`: Cancelamento de pagamentos
  - `ProcessPaymentWebhookUseCase`: Processamento de webhooks
  - `UpdatePaymentStatusWithTransactionIdUseCase`: Atualização de status
  - `GetExternalReferenceByTransactionUseCase`: Busca de referência
- **Controllers**: Recebem requisições HTTP
- **Presenters**: Formatam respostas para o cliente

#### 🔧 Infrastructure (Infraestrutura)
- **Database**: Implementação do MongoDB com repositórios
- **Gateways**: Integração com Mercado Pago API
- **Guards**: Validação de webhooks e autenticação JWT
- **Shared**: Utilitários e helpers

## 🔄 Integração com Mercado Pago

### Fluxo de Pagamento

1. **Cliente solicita pagamento** → API cria transação no Mercado Pago
2. **Mercado Pago retorna QR Code** → Cliente escaneia e paga
3. **Mercado Pago processa pagamento** → Envia webhook para nossa API
4. **API atualiza status** → Notifica sistema de pedidos

### Configuração no Mercado Pago

1. Acesse o [Painel de Desenvolvedores](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Obtenha o **Access Token**
4. Configure a URL do webhook: `https://seu-dominio.com/payment/webhook`
5. Selecione os eventos: `payment.created`, `payment.updated`

### Ambiente de Testes (Sandbox)

O Mercado Pago oferece um ambiente de testes:
- Use credenciais de teste do painel
- Utilize cartões de teste para simular pagamentos
- Webhooks funcionam normalmente

## 📊 Monitoramento e Observabilidade

### Health Check
O endpoint `/health` fornece informações sobre:
- Status da aplicação
- Conexão com MongoDB
- Tempo de resposta

---

**Documentação**: [Swagger UI](http://localhost:1337/api-docs)  
**Collections para testes**: [Collection payment](https://drive.google.com/file/d/12WmL1zfXAoUVktYUGq4pYm_CDR5q-NO4/view?usp=sharing)  
**Quality Gate**: [SonarCloud](https://sonarcloud.io/dashboard?id=vinicius0012_11soat-fast-food-fase-4-api-payment)
