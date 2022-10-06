import { Query, Recipe } from './assets/interfaces';
import firebase from './FirebaseConfig';

const firestore = firebase.firestore();

const createDocument = (collection: string, document: Recipe) => {
  return firestore.collection(collection).add(document);
};

interface Props {
  collection: string,
  queries: Query[],
  orderByField: string,
  orderByDirection: string,
  perPage: number,
  cursorId: string
}

const readDocument = (collection: string, id: string) => {
  return firestore.collection(collection).doc(id).get();
}

const readDocuments = async (props: Props) => {
  const { collection, queries, orderByField, orderByDirection, perPage, cursorId } = props;
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

  if(orderByField && orderByDirection){
    collectionRef = collectionRef.orderBy(orderByField, orderByDirection as firebase.firestore.OrderByDirection);
  }

  if(perPage) {
    collectionRef = collectionRef.limit(perPage);
  }
  if(cursorId) {
    const document = await readDocument(collection, cursorId);

    collectionRef = collectionRef.startAfter(document);
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