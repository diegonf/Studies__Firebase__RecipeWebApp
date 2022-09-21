import { Recipe } from './assets/interfaces';
import firebase from './FirebaseConfig';

const firestore = firebase.firestore();

const createDocument = (collection: string, document: Recipe) => {
  return firestore.collection(collection).add(document);
};

const readDocuments = (collection: string) => {
  return firestore.collection(collection).get();
}

const FirebaseFirestoreService = {
  createDocument,
  readDocuments,
};

export default FirebaseFirestoreService;