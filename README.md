# INFO SISTEMA VEHICLE

## Descrição

Este é um projeto backend desenvolvido com Node.js e NestJS, com o objetivo de criar uma API RESTful para gerenciamento de veículos. A aplicação permite realizar operações de CRUD (Create, Read, Update, Delete) sobre registros de veículos, armazenando dados como placa, chassi, renavam, modelo, marca e ano.

O projeto foi estruturado com boas práticas de desenvolvimento, utilizando NestJS por sua robustez e escalabilidade, e inclui testes unitários com Jest para garantir a confiabilidade das funcionalidades principais.

Além disso, o backend está preparado para ser executado em ambiente Docker via Docker Compose, facilitando a configuração e execução da aplicação em diferentes ambientes.

## Conteúdo
- [Instalação e Execução](#instalação-e-execução)
- [Features](#features)
    - 1.1 [Criar um veículo](#vehicle)
    - 1.2 [Editar um veículo](#editar)
    - 1.3 [Deletar um veículo](#deletar)
    - 1.4 [Listar todos os veículos](#listar)
    - 1.5 [Listar veículos e filtrá-los por id](#listar)
- [Testes unitários](#testes)
- [Arquitetura](#arquitetura)

## Instalação e Execução
 
### 1. Clonar o Repositório

Clone o repositório do GitHub para sua máquina local:

```bash
git clone https://github.com/ThalesAbdon/infosistema-vehicle-api
```

### 2. Instalar Dependências
Acesse a pasta root
```
cd vehicles-api
```
Execute o comando:
```
npm install
```
### 3. Configurar Variáveis de Ambiente
Verifique as variavéis de ambiente no arquivo
```
.env.example
```
### 4. Execute o script do Docker
```
sudo docker compose up
```
quando quiser encerrar o programa dê control + C 

# Features
## Vehicle  

### Registrar um veículo 

  - Para criar um veículo, utilizamos uma rota POST:
   ```http://localhost:3000/vehicles``` 
   
   Com o seguinte json:

    {
      "placa": "BGH3T52",
      "chassi": "9BWZZZ377VT987654",
      "renavam": "11223344556",
      "modelo": "Celta",
      "marca": "Chevrolet",
      "ano": 2000
    }
    
   É válido lembrar que placa, chassi e renavam são únicos; portanto, caso já existam no sistema, o usuário receberá um aviso.
### Editar
  - Para editar(atualizar) um veículo, utilizamos uma rota PUT
   ```http://localhost:3000/vehicles/:id``` 

  - É necessário colocar um id válido! 

   Apesar de ser um PUT, o endpoint aceita atualizações parciais. Ou seja, é possível alterar apenas um campo ou todos, por exemplo:

    {
      "modelo": "Celta",
      "marca": "Chevrolet",
      "ano": 2000
    }

### Deletar
  - Para deletar um veículo, utilizamos uma rota DELETE
   ```http://localhost:3000/vehicles/:id``` 
   
  - É necessário colocar um id válido! 

### Listar
  - Para listar todos os veículos, utilizamos uma rota GET:
   ```http://localhost:3000/vehicles``` 
   
  - Se não tiver nenhum parametro, então o retorno será de todos os veículos!

  - Também é possível listar por parametros, por exemplo: encontrar todos os veículos da marca Ford
     ```http://localhost:3000/vehicles?search=Ford``` 

### Encontrar Veículo por um id 
   - Para buscar um veículo pelo id, utilizamos uma rota GET:
   ```http://localhost:3000/veículos/:id``` 
   
  - É necessário colocar um id válido! 

## Testes

![Captura de tela 2025-05-06 072649](https://github.com/user-attachments/assets/44bb6d82-07ad-4833-bf96-66338d0f67e3)

Foram implementados testes unitários para os principais casos de uso

Para rodar basta digitar:
   ```npm run test``` 
       e caso queira ver a cobertura de testes:
  ```npm run test:cov``` 


## Arquitetura
![arq](https://github.com/user-attachments/assets/eb4fce49-fb16-4b8a-89d4-450755d942a1)

Esta arquitetura é apreciada por sua clara separação de responsabilidades. O padrão divide a aplicação em três camadas principais:

Controller: Responsável por expor a funcionalidade para consumo por entidades externas, como interfaces de usuário. Atua como uma camada fina que passa solicitações para o serviço.

Service: Contém a lógica de negócios da aplicação. Realiza operações necessárias e, se precisar buscar ou salvar dados, interage com a camada de Repositório.

Repository: Cuida do armazenamento e recuperação de dados. Não se preocupa com quem está chamando, apenas realiza as operações solicitadas.

Benefícios:
 - Separação de Responsabilidades: Cada camada tem uma função clara e específica, facilitando a manutenção e a compreensão do código.
 
 - Testabilidade: Cada camada pode ser testada isoladamente, o que simplifica os testes unitários e permite a criação de mocks para as camadas adjacentes.

 - Código Limpo: Mantém o código organizado, evitando a mistura de lógica de negócios com operações de armazenamento ou controle.

