current_path = 1

function renderDoc(doc) {
    document.querySelectorAll('canvas').forEach(element => element.remove())

    const url = `/songs/${doc}`

    async function renderPage(page, scale) {
        const viewport = page.getViewport({ scale: scale })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.className = 'pdf-page'
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({ canvasContext: context, viewport: viewport }).promise
        document.getElementById('pdf-container').appendChild(canvas)
    }

    pdfjsLib.getDocument(url).promise
        .then(async (pdfDoc) => {
            const scale = 1.3
            const numPages = pdfDoc.numPages

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum)
                await renderPage(page, scale)
            }
        })
    }

    renderDoc(current_path)

    var socket = io("http://100.91.239.88:3000");
    socket.on('change', (msg) => {
        if(msg === 'n') {
            current_path++
        }else if(msg === 'p') {
            current_path--
        }
        renderDoc(current_path)
    });