const express = require('express')
const app = express();
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
require('dotenv').config()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

// let persons = [
//     {
//       name: 'Arto Hellas',
//       number: '040-123456',
//       id: 1
//     },
//     {
//       name: 'Ada Lovelace',
//       number: '39-44-5323523',
//       id: 2
//     },
//     {
//       name: 'Dan Abramov',
//       number: '12-43-234345',
//       id: 3
//     },
//     {
//       name: 'Mary Poppendieck',
//       number: '39-23-6423122',
//       id: 4
//     },
//   ]




morgan.token('request-body', (req, res) => {
    if (req.method === 'POST' && req.body) {
        return JSON.stringify(req.body)
    }
    return '-';
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))



// app.get('/api/persons', (req, res) => {
//     res.json(persons)
// })

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
    .catch(error => next(error))
})


// app.get('/api/persons/:id', (req, res) => {
//     const id = Number(req.params.id)
//     const person = persons.find(person => person.id === id)

//     if (person) {
//         res.json(person)
//     } else {
//         res.status(404).end()
//     }
// })


app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if (person) {
            res.json(person)
        } else {
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})


/// 
// Note.find({}).then(result => {
//   result.forEach(note => {
//     console.log(note)
//   })
//   mongoose.connection.close()
// })

// app.get('/api/notes', (request, response) => {
//   Note.find({}).then(notes => {
//     response.json(notes)
//   })
// })



app.get('/info', (req, res, next) => {
    const now = new Date()

    Person.find({}).then(persons => {
        const entriesCount = persons.length

        res.send(`
            <p>Phonebook has info for ${entriesCount} people</p>
            <p>${now}</p>
        `)
    })
    .catch(error => next(error))
    
})






// app.delete('/api/persons/:id', (req, res) => {
//     const id = Number(req.params.id)
//     persons = persons.filter(person => person.id !== id)

//     res.status(204).end()
// })


app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
})




// const generateId = () => {
//     const maxId = persons.length > 0
//         ? Math.max(...persons.map(p => p.id))
//         : 0
//     return maxId + 1
// }

// app.post('/api/persons', (req, res) => {
//     const body = req.body

//     if (!body.name?.trim() || !body.number?.trim()) {
//         return res.status(400).json({
//             error: 'name or number is missing'
//         })
//     }

//     const existingName = persons.find(
//         person => person.name.toLocaleLowerCase() === body.name.trim().toLocaleLowerCase()
//     )

//     if (existingName) {
//         return res.status(409).json({
//             error: 'name must be unique'
//         })
//     }

//     const person = {
//         name: body.name.trim(),
//         number: body.number.trim(),
//         id: generateId(), 
//     }

//     persons = persons.concat(person)
//     res.status(201).json(person)
// })


// app.post('/api/persons', (req, res, next) => {
//     const { name, number } = req.body
//     console.log('veja aqui', req.body.content)
    
//     if (name && number === undefined) {
//         return res.status(400).json({ error: 'content missing' })
//     }

//     const person = new Person({
//         name,
//         number,
//     })

//     person.save().then(savedPerson => {
//         res.json(savedPerson)
//     })
//     .catch(error => next(error))
// })


app.post('/api/persons', (req, res, next) => {
    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
    .then(savedPerson => {
        res.json(savedPerson)
    })
    .catch(error => next(error))
})


// app.put('/api/persons/:id', (req, res, next) => {
//     const body = req.body
//     console.log('body', body.content)

//     const person = {
//         name: body.name,
//         number: body.number
//     }

//     Person.findByIdAndUpdate(req.params.id, person, { returnDocument: 'after' })
//     .then(updatedPerson => {
//         res.json(updatedPerson)
//     })
//     .catch(error => next(error))

// })

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { returnDocument: 'after' , runValidators: true, context: 'query' }
    )
    .then(updatedPerson => {
        res.json(updatedPerson)
    })
    .catch(error => next(error))
})


const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    } 

    next(error)
}




app.use(errorHandler)


const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})