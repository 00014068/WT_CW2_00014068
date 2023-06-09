const { log } = require('console')
const express = require('express')
const app = express()

const fs = require('fs')

app.set('view engine', 'pug')

app.use('/static', express.static('public'))
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/create', (req,res) => {
    res.render('create')
})

app.post('/create', (req,res) => {
    const title = req.body.title
    const description = req.body.description

    if (title.trim() === '' || description.trim() === '') {
        res.render('create', { error: true })
    } else {
        fs.readFile('./data/notes.json', ( err, data) => {
            if (err) throw err

            const notes = JSON.parse(data)

            notes.push({
                id: id(),
                title: title,
                description: description,
            })

            fs.writeFile('./data/notes.json', JSON.stringify(notes), err => {
                if (err) throw err

                res.render('create', { success: true })
            })
        })
    }
})

app.get('/api/v1/notes', (req, res) => {
    fs.readFile('./data/notes.json', (err, data) => {
        if (err) throw err

        const notes = JSON.parse(data)

        res.json(notes)
    })
})

app.get('/notes', (req,res) => {
    fs.readFile('./data/notes.json', (err, data) => {
        if (err) throw err

        const notes = JSON.parse(data)

        res.render('notes', { notes: notes })
    })
})

const getNoteController = (page) => (req,res) => {
    const id = req.params.id

    fs.readFile('./data/notes.json', (err, data) => {
        if (err) throw err 

        const notes = JSON.parse(data)

        const note = notes.filter(note => note.id == id)[0]

        res.render(page, { note: note })
    })
};

app.get('/notes/:id', getNoteController('detail'))
app.get('/notes/:id/edit', getNoteController('edit-note'))

app.post('/notes/:id/edit', (req, res) => {
    const { title, description } = req.body
    const id = req.params.id

    fs.readFile('./data/notes.json', ( err, data) => {
        if (err) throw err

        const notes = JSON.parse(data)

        const noteToUpdate = notes.find((note) => note.id === id);

        noteToUpdate.title = title;
        noteToUpdate.description = description;

        fs.writeFile('./data/notes.json', JSON.stringify(notes), err => {
            if (err) throw err

            res.render('notes', { notes: notes })
        })
    })
})


app.get('/:id/delete', (req, res) => {
    const id = req.params.id

    fs.readFile('./data/notes.json', (err, data) => {
        if (err) throw err

        const notes = JSON.parse(data)

        const notesFiltered = notes.filter(note => note.id != id)

        fs.writeFile('./data/notes.json', JSON.stringify(notesFiltered), (err) => {
            if (err) throw err

            res.render('notes', { notes: notesFiltered, delete: true })
        })
    })
})



app.listen(8000, err => { 
    if (err) console.log(err)

    console.log('Server is running on port 8000...')
})

function id () {
    return '_' + Math.random().toString(36).substr(2, 9);
}