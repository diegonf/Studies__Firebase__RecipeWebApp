import { Query, Recipe } from './assets/interfaces';
import firebase from './FirebaseConfig';

const auth = firebase.auth();

const BASE_URL = process.env.REACT_APP_CLOUD_FIRESTORE_FUNCTION_API_URL;

const createDocument = async (collection: String, document: Recipe) => {
  let token;

  try {
    token = await auth.currentUser?.getIdToken();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      throw error;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/${collection}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(document)
    })

    if (response.status !== 201) {
      const errorMessage = await response.text();
      const error = { message: errorMessage };

      throw error;
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      throw error;
    }
  }
};

interface PropsReadDocuments {
  collection: string,
  queries?: Query[],
  orderByField?: string,
  orderByDirection?: string,
  perPage?: number,
  pageNumber?: number
}
const readDocuments = async (props: PropsReadDocuments) => {
  const { collection, queries, orderByField, orderByDirection, perPage, pageNumber } = props;

  try {
    const url = new URL(`${BASE_URL}/${collection}`);

    if(queries && queries.length > 0){
      for (const query of queries) {
        url.searchParams.append(query.field, query.value);
      }
    }

    if (orderByField) {
      url.searchParams.append('orderByField', orderByField);
    }

    if (orderByDirection) {
      url.searchParams.append('orderByDirection', orderByDirection);
    }

    if (perPage) {
      url.searchParams.append('perPage', perPage.toString());
    }

    if (pageNumber) {
      url.searchParams.append('pageNumber', pageNumber.toString());
    }

    let token;
    try {
      token = await auth.currentUser?.getIdToken();
    } catch (error) {
      // continue
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })

    if (response.status !== 200) {
      const errorMessage = await response.text();
      const error = { message: errorMessage };

      throw error;
    }

    return response.json();

  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      throw error;
    }
  }
};

const updateDocument = async (collection: string, document: Recipe, id: string) => {
  let token;

  try {
    token = await auth.currentUser?.getIdToken();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      throw error;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/${collection}/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(document)
    })

    if (response.status !== 200) {
      const errorMessage = await response.text();
      const error = { message: errorMessage };

      throw error;
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      throw error;
    }
  }
};

const deleteDocument = async (collection: string, id: string) => {
  let token;

  try {
    token = await auth.currentUser?.getIdToken();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      throw error;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/${collection}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status !== 200) {
      const errorMessage = await response.text();
      const error = { message: errorMessage };

      throw error;
    }

  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
      throw error;
    }
  }
};

const FirebaseFirestoreRestService = {
  createDocument,
  readDocuments,
  updateDocument,
  deleteDocument
};

export default FirebaseFirestoreRestService;