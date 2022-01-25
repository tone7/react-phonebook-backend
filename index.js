const express = require('express')
const { header } = require('express/lib/request')
const app = express()
const morgan = require('morgan')

const skipAllOther = (req, res) => req.method !== "POST"
const skipPost = (req, res) => req.method === "POST" 

morgan.token('bodyJSON', req => JSON.stringify(req.body || {}))

morgan.token('bodyJSON', (req, res) => {
    if(!req.body.name && !req.body.number){
        req.body.error = "name and number missing"
        return JSON.stringify(req.body)
    } else if(!req.body.name){
        req.body.error = "name missing"
        return JSON.stringify(req.body)
    } else if(!req.body.number) {
        req.body.error = "number missing"
        return JSON.stringify(req.body)
    } else {
        return JSON.stringify(req.body)
    }
})

app.use(express.json())
app.use(morgan('tiny', {
    skip: skipPost
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodyJSON', {
    skip: skipAllOther
}))

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)  
    } else {    
        response.status(404).end()  
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(p => p.id))
        : 0
    return maxId + 1
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({ 
            error: 'name missing' 
        })
    } else if(!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    } else if(persons.find(person => person.name === body.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)

    response.json(person)
})

app.get('/info', (request, response) => {
    const numberPersons = persons.length
    const date = new Date()

    const htmlResponse = `
        <p>Phonebook has info for ${numberPersons} people</p>
        <p>${date}</p>
    `

    response.send(htmlResponse)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})