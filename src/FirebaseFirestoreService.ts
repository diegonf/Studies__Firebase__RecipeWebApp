import { Query, Recipe } from './assets/interfaces';
import firebase from './FirebaseConfig';

const firestore = firebase.firestore();

const createDocument = (collection: string, document: Recipe) => {
  return firestore.collection(collection).add(document);
};

interface Props {
  collection: string,
  queries: Query[]
}
const readDocuments = (props: Props) => {
  const { collection, queries } = props;
  let collectionRef: firebase.firestore.Query<firebase.firestore.DocumentData> = firestore.collection(collection);

  if(queries && queries.length > 0) {
    for(const query of queries) {
      collectionRef = collectionRef.where(
        query.field,
        query.condition as firebase.firestore.WhereFilterOp,
        query.value
      );
    }
  }

  return collectionRef.get();
}

const updateDocument = (collection: string, id: string, document: Recipe) => {
  return firestore.collection(collection).doc(id).update(document);
}

const deleteDocument = (collection: string, id: string) => {
  return firestore.collection(collection).doc(id).delete();
}

const FirebaseFirestoreService = {
  createDocument,
  readDocuments,
  updateDocument,
  deleteDocument,
};

export default FirebaseFirestoreService;