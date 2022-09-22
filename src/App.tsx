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
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>();
  FirebaseAuthService.subscribeToAuthChanges(setUser);

  useEffect(() => {
    fetchRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes)
      })
      .catch((error) => {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRecipes = async () => {
    const queries = [];
    if (!user) {
      queries.push({
        field: 'isPublished',
        condition: "==",
        value: true
      });
    }

    let fetchedRecipes;
    try {
      const response = await FirebaseFirestoreService.readDocuments({ collection: 'recipes', queries: queries });

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
  };

  const handleFetchRecipes = async () => {
    try {
      const fetchedRecipes = await fetchRecipes();
      setRecipes(fetchedRecipes)
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  };

  const handleAddRecipe = async (newRecipe: Recipe) => {
    try {
      const response = await FirebaseFirestoreService.createDocument('recipes', newRecipe);

      handleFetchRecipes();

      alert(`Succesfully created a recipe with ID = ${response.id}`);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  const handleUpdateRecipe = async (newRecipe: Recipe, recipeId: string) => {
    try {
      await FirebaseFirestoreService.updateDocument('recipes', recipeId, newRecipe);

      handleFetchRecipes();
      alert(`successfully updated a recipe with an ID = ${recipeId}`);
      setCurrentRecipe(null);

    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    const deleteConfirmation = window.confirm("Are you sure you want to delete this recipe? Ok for Yes. Cancel for No.");
    if (deleteConfirmation) {
      try {
        await FirebaseFirestoreService.deleteDocument('recipes', recipeId);

        handleFetchRecipes();

        setCurrentRecipe(null);

        window.scrollTo(0, 0);

        alert(`successfully deleted a recipe with an ID = ${recipeId}`)
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      }
    }
  }

  const handleEditRecipeClick = (recipeId: string) => {
    console.log(recipeId);
    const selectedRecipe = recipes?.find((recipe) => {
      return recipe.id === recipeId;
    });

    console.log(selectedRecipe);
    if (selectedRecipe) {
      console.log('if');
      setCurrentRecipe(selectedRecipe);
      console.log('if after set current recipe');
      // window.scrollTo(0, document.body.scrollHeight);
    }
  };

  const handleEditRecipeCancel = () => {
    setCurrentRecipe(null);
  }

  const lookupCategoryLabel = (categoryKey: string) => {
    const categories = {
      breadSandwichesAndPizza: 'Breads, Sandwiches, and Pizza',
      eggsAndBreakfast: 'Eggs & Breakfast',
      dessertsAndBakedGoods: 'Desserts & Baked Goods',
      fishAndSeafood: 'Fish & Sefood',
      vegetables: 'Vegetables',
    };

    const label = categories[categoryKey as keyof typeof categories];
    return label;
  };

  const formatData = (date: Date) => {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${day}-${month}-${year}`;

    return dateString;
  };

  return (
    <div className="App">
      <div className='title-row'>
        <h1 className='title'>Firebase Recipes</h1>
        <LoginForm existingUser={user} />
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
                          {
                            recipe.isPublished === false ? (
                              <div className='unpublished'>UNPUBLISHED</div>
                            ) : null
                          }
                          <div className='recipe-name'>{recipe.name}</div>
                          <div className='recipe-field'>Category: {lookupCategoryLabel(recipe.category)}</div>
                          <div className='recipe-field'>Publish Date: {formatData(recipe.publishDate)}</div>
                          {
                            user ? (
                              <button
                                type='button'
                                onClick={() => handleEditRecipeClick(recipe.id as string)}
                                className='primary-button edit-button'
                              >Edit</button>
                            ) : null
                          }
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
          user ?
            <AddEditRecipeForm
              existingRecipe={currentRecipe}
              handleAddRecipe={handleAddRecipe}
              handleUpdateRecipe={handleUpdateRecipe}
              handleDeleteRecipe={handleDeleteRecipe}
              handleEditRecipeCancel={handleEditRecipeCancel}
            /> : null
        }
      </div>
    </div>
  );
}

export default App;
