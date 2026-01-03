Funcionalidade: Criar Pagamento
  Como um sistema de pedidos
  Eu quero criar um pagamento para um pedido
  Para que o cliente possa efetuar o pagamento via QR Code

  Contexto:
    Dado que o serviço de pagamento está disponível
    E que o sistema está configurado corretamente

  Cenário: Criar pagamento com sucesso com todos os dados obrigatórios
    Dado que eu tenho um pedido válido com os seguintes dados:
      | campo       | valor                |
      | orderId     | 123                  |
      | amount      | 100                  |
      | description | Test payment         |
    E os dados do cliente são:
      | campo    | valor             |
      | id       | 1                 |
      | name     | John Doe          |
      | email    | john@example.com  |
      | document | 12345678900       |
    Quando eu envio uma requisição POST para "/payment/create"
    Então o status da resposta deve ser 201
    E a resposta deve conter um "transactionId"
    E a resposta deve conter um "qrCodeBase64"
    E a resposta deve conter um "qrCodeString"
    E a resposta deve conter uma "urlPayment"
    E o status do pagamento deve ser "PENDING"

  Cenário: Criar pagamento com callbackUrl personalizada
    Dado que eu tenho um pedido válido com os seguintes dados:
      | campo       | valor                |
      | orderId     | 123                  |
      | amount      | 100                  |
      | description | Test payment         |
      | callbackUrl | http://callback.url  |
    E os dados do cliente são:
      | campo    | valor             |
      | id       | 1                 |
      | name     | John Doe          |
      | email    | john@example.com  |
      | document | 12345678900       |
    Quando eu envio uma requisição POST para "/payment/create"
    Então o status da resposta deve ser 201
    E a resposta deve conter um "transactionId"
    E o pagamento deve ter sido criado com a callbackUrl fornecida

  Cenário: Criar pagamento com lista de itens
    Dado que eu tenho um pedido válido com os seguintes dados:
      | campo       | valor        |
      | orderId     | 123          |
      | amount      | 100          |
      | description | Test payment |
    E os dados do cliente são:
      | campo    | valor             |
      | id       | 1                 |
      | name     | John Doe          |
      | email    | john@example.com  |
      | document | 12345678900       |
    E a lista de itens contém:
      | id    | title     | quantity | unit_price |
      | item1 | Product A | 2        | 50         |
    Quando eu envio uma requisição POST para "/payment/create"
    Então o status da resposta deve ser 201
    E a resposta deve conter um "transactionId"

  Cenário: Falha ao criar pagamento sem dados obrigatórios
    Dado que eu tenho um pedido sem os dados obrigatórios
    Quando eu envio uma requisição POST para "/payment/create"
    Então o status da resposta deve ser 400
    E a resposta deve conter uma mensagem de erro de validação

  Cenário: Falha ao criar pagamento quando o serviço de pagamento está indisponível
    Dado que eu tenho um pedido válido com os seguintes dados:
      | campo       | valor        |
      | orderId     | 123          |
      | amount      | 100          |
      | description | Test payment |
    E os dados do cliente são:
      | campo    | valor             |
      | id       | 1                 |
      | name     | John Doe          |
      | email    | john@example.com  |
      | document | 12345678900       |
    E o serviço de pagamento está indisponível
    Quando eu envio uma requisição POST para "/payment/create"
    Então o status da resposta deve ser 500
    E a resposta deve conter uma mensagem de erro

  Cenário: Criar pagamento sem informações do cliente
    Dado que eu tenho um pedido válido com os seguintes dados:
      | campo       | valor        |
      | orderId     | 123          |
      | amount      | 100          |
      | description | Test payment |
    E não há dados do cliente
    Quando eu envio uma requisição POST para "/payment/create"
    Então o status da resposta deve ser 201
    E a resposta deve conter um "transactionId"
    E o pagamento deve ter sido criado sem informações do cliente

  Cenário: Criar pagamento com valor mínimo
    Dado que eu tenho um pedido válido com os seguintes dados:
      | campo       | valor        |
      | orderId     | 123          |
      | amount      | 0.01         |
      | description | Test payment |
    E os dados do cliente são:
      | campo    | valor             |
      | id       | 1                 |
      | name     | John Doe          |
      | email    | john@example.com  |
      | document | 12345678900       |
    Quando eu envio uma requisição POST para "/payment/create"
    Então o status da resposta deve ser 201
    E a resposta deve conter um "transactionId"
    E o valor do pagamento deve ser 0.01

  Cenário: Criar pagamento com valor alto
    Dado que eu tenho um pedido válido com os seguintes dados:
      | campo       | valor        |
      | orderId     | 123          |
      | amount      | 99999.99     |
      | description | Test payment |
    E os dados do cliente são:
      | campo    | valor             |
      | id       | 1                 |
      | name     | John Doe          |
      | email    | john@example.com  |
      | document | 12345678900       |
    Quando eu envio uma requisição POST para "/payment/create"
    Então o status da resposta deve ser 201
    E a resposta deve conter um "transactionId"
    E o valor do pagamento deve ser 99999.99

