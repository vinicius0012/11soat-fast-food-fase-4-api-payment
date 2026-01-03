# Testes BDD - Módulo de Pagamento

Este diretório contém as especificações BDD (Behavior Driven Development) para o módulo de pagamento do sistema Fast Food.

## Estrutura

```
features/payment/
├── create-payment.feature    # Especificação BDD para criação de pagamentos
└── README.md                 # Este arquivo
```

## Arquivos Feature

### create-payment.feature

Especificação em formato Gherkin (PT-BR) que descreve os comportamentos esperados para a criação de pagamentos via API.

#### Cenários Cobertos:

1. **Criar pagamento com sucesso com todos os dados obrigatórios**
   - Validação de criação de pagamento com dados completos
   - Verificação da geração de QR Code e URL de pagamento

2. **Criar pagamento com callbackUrl personalizada**
   - Validação de criação com URL de callback customizada

3. **Criar pagamento com lista de itens**
   - Validação de criação com múltiplos itens no pedido

4. **Falha ao criar pagamento sem dados obrigatórios**
   - Validação de regras de negócio e campos obrigatórios

5. **Falha ao criar pagamento quando o serviço de pagamento está indisponível**
   - Tratamento de erros quando o serviço externo está fora do ar

6. **Criar pagamento sem informações do cliente**
   - Validação de pagamento anônimo (sem dados do cliente)

7. **Criar pagamento com valor mínimo**
   - Validação de limites mínimos de valor

8. **Criar pagamento com valor alto**
   - Validação de limites máximos de valor

9. **Criar pagamento com dados inválidos**
   - Validação de dados incorretos ou malformados

## Implementação dos Testes

Os testes correspondentes aos cenários BDD estão implementados em:
```
src/modules/payment/controllers/payment.controller.spec.ts
```

### Estrutura dos Testes BDD

Os testes seguem o padrão **Given-When-Then**:

- **Given (Dado)**: Estado inicial e pré-condições
- **When (Quando)**: Ação ou evento que ocorre
- **Then (Então)**: Resultado esperado

### Exemplo de Implementação

```typescript
describe('BDD: Criar Pagamento', () => {
  describe('Cenário: Criar pagamento com sucesso', () => {
    it('Dado que eu tenho um pedido válido, Quando eu envio uma requisição POST, Então o status deve ser 201', async () => {
      // Dado - Given
      const createPaymentDto = { ... };
      
      // Quando - When
      const result = await controller.createPayment(createPaymentDto);
      
      // Então - Then
      expect(result).toBeDefined();
      expect(result.transactionId).toBeDefined();
    });
  });
});
```

## Como Executar os Testes

### Executar todos os testes do módulo de pagamento:
```bash
npm test -- payment.controller.spec.ts
```

### Executar apenas os testes BDD:
```bash
npm test -- payment.controller.spec.ts -t "BDD: Criar Pagamento"
```

### Executar um cenário específico:
```bash
npm test -- payment.controller.spec.ts -t "Cenário: Criar pagamento com sucesso"
```

### Executar com cobertura:
```bash
npm run test:cov -- payment.controller.spec.ts
```

## Manutenção

Ao adicionar novos comportamentos ao sistema de pagamento:

1. Adicione o cenário no arquivo `.feature` correspondente
2. Implemente o teste seguindo o padrão Given-When-Then
3. Execute os testes para garantir que estão passando
4. Atualize este README se necessário

## Convenções

- Cenários escritos em português brasileiro
- Nomenclatura clara e descritiva
- Testes independentes e isolados
- Uso de mocks para dependências externas
- Validação de campos críticos do negócio

## Referências

- [Gherkin Syntax](https://cucumber.io/docs/gherkin/reference/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

