const express = require('express')
const app = express();
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(cors())

let persons = [
    {
      name: 'Arto Hellas',
      number: '040-123456',
      id: 1
    },
    {
      name: 'Ada Lovelace',
      number: '39-44-5323523',
      id: 2
    },
    {
      name: 'Dan Abramov',
      number: '12-43-234345',
      id: 3
    },
    {
      name: 'Mary Poppendieck',
      number: '39-23-6423122',
      id: 4
    },
  ]




morgan.token('request-body', (req, res) => {
    if (req.method === 'POST' && req.body) {
        return JSON.stringify(req.body)
    }
    return '-';
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))



app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.get('/info', (req, res) => {
    const now = new Date()
    const entriesCount = persons.length

    res.send(`
            <p>Phonebook has info for ${entriesCount} people</p>
            <p>${now}</p>
        `)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})


const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(p => p.id))
        : 0
    return maxId + 1
}

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name?.trim() || !body.number?.trim()) {
        return res.status(400).json({
            error: 'name or number is missing'
        })
    }

    const existingName = persons.find(
        person => person.name.toLocaleLowerCase() === body.name.trim().toLocaleLowerCase()
    )

    if (existingName) {
        return res.status(409).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name.trim(),
        number: body.number.trim(),
        id: generateId(), 
    }

    persons = persons.concat(person)
    res.status(201).json(person)
})


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})