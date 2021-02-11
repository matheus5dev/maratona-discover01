const Modal = {
  abrirModal(){
    document.querySelector('.modal-overlay').classList.add('active')
  },
  fecharModal() {
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

const Storage = {
  get(){
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions){
    localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),
  
  add(transaction){
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index){
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes(){
    let income = 0
    // Pegar todas as transaçoes
    Transaction.all.forEach(transaction => {
      //se for maior que zero
      if( transaction.amount > 0 ){
        // Somar a uma variavel e retorna-lá
        income += transaction.amount;
      }
    })

    return income;
  },

  expenses(){
    let expense = 0
    // Pegar todas as transaçoes
    Transaction.all.forEach(transaction => {
      //se for maior que zero
      if( transaction.amount < 0 ){
        // Somar a uma variavel e retorna-lá
        expense += transaction.amount;
      }
    })

    return expense;
  },

  total(){
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index){
    // Criando tr da tabela
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innetHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  // Criando função para criar o elemento html
  innetHTMLTransaction(transaction, index){
    // Colocando a classe se for negativo ou positivo
    const CSSclass = transaction.amount > 0 ? "income" : "expense"


    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
    `

    return html
  },

  updateBalance(){
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Utils = {
  formatAmount(value){
    // Para trocar virgula e ponto por nada: replace(/\,\./g, "")
    value = Number(value) * 100

    return value
  },

  formatDate(date){
    const splitedDate = date.split('-')
    return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
  },
  // Função para converter o real
  formatCurrency(value){
    // Se o value for menor que zero, adiciona sianl negativo
    const signal = Number(value) < 0 ? "-" : ""

    // /\D/g: g = faça uma pesquisa global; /\D/ = Tudo que não for numero
    // Troque por ""(nada)
    value = String(value).replace(/\D/g, "")

    // Dividindo por 100 para ficar em formato real
    value = Number(value) / 100

    // Adicionando cifrão da moeda BRL
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues(){
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields(){
    const { description, amount, date } = Form.getValues()

    if(description.trim()  === "" || 
      amount.trim() === "" || 
      date.trim() == ""){
        throw new Error("Preencha todos os campos")
    }
  },

  formatValues(){
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFilds(){
    Form.description.value = "",
    Form.amount.value = "",
    Form.date.value = ""
  },

  submit(event){
    event.preventDefault()

    try {
      // Verficar se todas a infos foram preenchidas
      Form.validateFields()
      // Formatar os dados para salvar
      const transaction = Form.formatValues()
      // Salvar e Atualizar a aplicação
      Transaction.add(transaction)
      // Apagar os dados do formulario
      Form.clearFilds()
      // Modal feche
      Modal.fecharModal()

    } catch (error){
      alert(error.message)
    }
  }
}

const App = {
  init() {
    // Percorrendo o array de transaction e passando para o html
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  
  reload(){
    DOM.clearTransactions()
    App.init()
  }
}

App.init()