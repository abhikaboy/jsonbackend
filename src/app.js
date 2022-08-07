import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import Realm from 'realm';
import { Server } from 'socket.io';
import { createServer } from 'https';
const io = new Server(httpServer, {
	/* options */
});
const app = express();

// Apply middlware for CORS and JSON endpoing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
io.on('connection', (socket) => {
	console.log(socket.id);
	socket.on('data-request', (room) => {
		// join the room, find the document
		// send the document, delete the document
		socket.join(room);
		const documents = realm.objects('Document');
		const matchingDocument = documents.filtered(`_id = '${room}'`);
		socket.to(room).emit('documents', matchingDocument);
		realm.delete(matchingDocument);
	});
});
const DocumentSchema = {
	name: 'Document',
	properties: {
		_id: 'string',
	},
	primaryKey: '_id',
};
app.get('/', (req, res) => {
	res.send('Hello World!');
});
app.post('/data', (req, res) => {
	const { id, data, schema } = req.params;
	// write data to realm with id tag
	realm.write(() => {
		realm.create('Document', {
			_id: id,
			data: data,
			schema: schema,
		});
	});
	// emits to the room with the thing
	// get a response from angular client that we can delete the data safely
});
const httpServer = createServer(app);

httpServer.listen(process.env.PORT, async () => {
	console.log('Example app listening on port 3000!');
	const realm = await Realm.open({
		path: 'myrealm',
		schema: [DocumentSchema],
	});
});
