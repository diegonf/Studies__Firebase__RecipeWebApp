import React, { useEffect } from 'react';
import { useState } from 'react'
import firebase from './FirebaseConfig';
import FirebaseAuthService from './FirebaseAuthService';
import './App.css';
import LoginForm from './components/LoginForm';
import AddEditRecipeForm from './components/AddEditRecipeForm';
import FirebaseFirestoreService from './FirebaseFirestoreService';
import { Recipe } from './assets/interfaces';

function App() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>();

  useEffect( ( ) => {
    fetchRecipes()
      .then( (fetchedRecipes) => {
        setRecipes(fetchedRecipes)
      })
      .catch((error) => {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      });
  }, [user])

  const fetchRecipes = async ( ) => {
    
    let fetchedRecipes;
    try {
      // type FirebaseResponse = {
      //   data?: {
      //     pokemon: Omit<PokemonData, 'fetchedAt'>
      //   }
      //   errors?: Array<{message: string}>
      // }
      // console.log(response.docs[0].data());
      // const {data, errors}: JSONResponse = await response.json()

      const response = await FirebaseFirestoreService.readDocuments('recipes');
      
      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        const data = recipeDoc.data();
        const dataRecipe: Recipe = {
          name: data.name,
          category: data.category,
          directions: data.directions,
          isPublished: data.isPublished,
          publishDate: new Date(data.publishDate.seconds * 1000),
          ingredients: data.ingredients,
          id: id
        };
        // return { ...data, id}
        return dataRecipe;
      })
      fetchedRecipes = [...newRecipes];
      return fetchedRecipes;

    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  }

  const handleFetchRecipes = async ( ) => {
    try {
      const fetchedRecipes = await fetchRecipes();
      setRecipes (fetchedRecipes)
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  }

  FirebaseAuthService.subscribeToAuthChanges(setUser);

  const handleAddRecipe = async (newRecipe: Recipe) => {
    try {
      const response = await FirebaseFirestoreService.createDocument('recipes', newRecipe);

      handleFetchRecipes();

      alert(`Succesfully created a recipe with ID = ${response.id}`);
    } catch (error) {
      if(error instanceof Error) alert(error.message);
    }
  }

  return (
    <div className="App">
      <div className='title-row'>
        <h1 className='title'>Firebase Recipes</h1>
        <LoginForm existingUser={user}/>
      </div>
      <div className='main'>
        <div className='center'>
          <div className='recipe-list-box'>
            {
              recipes && recipes.length > 0 ? (
                <div className='recipe-list'>
                  {
                    recipes.map((recipe) => {
                      return (
                        <div className='recipe-card' key={recipe.id}>
                          <div className='recipe-name'>{recipe.name}</div>
                          <div className='recipe-field'>Category: {recipe.category}</div>
                          <div className='recipe-field'>Publish Date: {recipe.publishDate.toString()}</div>
                        </div>
                      )
                    })
                  }
                </div>
              ) : null
            }
          </div>
        </div>
        {
          user ? <AddEditRecipeForm handleAddRecipe={handleAddRecipe}/> : null
        }
      </div>
    </div>
  );
}

export default App;
