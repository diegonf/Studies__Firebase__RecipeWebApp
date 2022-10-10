import React, { useEffect } from 'react';
import { useState } from 'react'
import firebase from './FirebaseConfig';
import FirebaseAuthService from './FirebaseAuthService';
import './App.css';
import LoginForm from './components/LoginForm';
import AddEditRecipeForm from './components/AddEditRecipeForm';
import { Recipe } from './assets/interfaces';
// import FirebaseFirestoreService from './FirebaseFirestoreService';
import FirebaseFirestoreRestService from './FirebaseFirestoreRestService';

function App() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [orderBy, setOrderBy] = useState('PublishDateDesc');
  const [recipesPerPage, setRecipesPerPage] = useState(3);
  const [isLastPage, setIsLastPage] = useState(false);
  const [totalNumberOfPages, setTotalNumberOfPages] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  FirebaseAuthService.subscribeToAuthChanges(setUser);

  useEffect(() => {
    setIsLoading(true);
    fetchRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes)
      })
      .catch((error) => {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      }).finally(() => {
        setIsLoading(false)
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, categoryFilter, orderBy, recipesPerPage, currentPageNumber]);

  const fetchRecipes = async (cursorId = '') => {
    const queries = [];

    if (categoryFilter) {
      queries.push({
        field: 'category',
        condition: '==',
        value: categoryFilter
      });
    }

    if (!user) {
      queries.push({
        field: 'isPublished',
        condition: "==",
        value: true
      });
    }

    const orderByField = "publishDate";
    let orderByDirection = '';
    if (orderBy) {
      switch (orderBy) {
        case 'publishDateAsc':
          orderByDirection = 'asc';
          break;
        case 'publishDateDesc':
          orderByDirection = 'desc';
          break;
        default:
          break;
      }
    }

    let fetchedRecipes;
    try {
      // const props = {
      //   collection: 'recipes',
      //   queries: queries,
      //   orderByField,
      //   orderByDirection,
      //   perPage: recipesPerPage,
      //   cursorId: cursorId
      // };
      // const response = await FirebaseFirestoreService.readDocuments(props);

      // const newRecipes = response.docs.map((recipeDoc) => {
      //   const id = recipeDoc.id;
      //   const data = recipeDoc.data();

      //   const dataRecipe: Recipe = {
      //     name: data.name,
      //     category: data.category,
      //     directions: data.directions,
      //     isPublished: data.isPublished,
      //     publishDate: new Date(data.publishDate.seconds * 1000),
      //     ingredients: data.ingredients,
      //     imageUrl: data.imageUrl,
      //     id: id
      //   };
      //   return dataRecipe;
      // })

      // if (cursorId) {
      //   fetchedRecipes = [...recipes as Recipe[], ...newRecipes];
      // } else {
      //   fetchedRecipes = [...newRecipes];
      // }

      // return fetchedRecipes;

      const props = {
        collection: 'recipes',
        queries: queries,
        orderByField,
        orderByDirection,
        perPage: recipesPerPage,
        pageNumber: currentPageNumber
      };
      const response = await FirebaseFirestoreRestService.readDocuments(props);

      if (response && response.documents) {
        const totalNumberOfPages = Math.ceil(
          response.recipeCount / recipesPerPage
        );

        setTotalNumberOfPages(totalNumberOfPages);

        const nextPageQuery = {
          collection: 'recipes',
          queries: queries,
          orderByField,
          orderByDirection,
          perPage: recipesPerPage,
          pageNumber: currentPageNumber + 1
        };

        const nextPageResponse = await FirebaseFirestoreRestService.readDocuments(nextPageQuery);

        if(
          nextPageResponse && 
          nextPageResponse.documents && 
          nextPageResponse.documents.length === 0
        ) {
          setIsLastPage(true);
        } else {
          setIsLastPage(false);
        }

        if(response.documents.length === 0 && currentPageNumber !== 1) {
          setCurrentPageNumber(currentPageNumber - 1);
        }

        fetchedRecipes = response.documents;

        fetchedRecipes.forEach((recipe: Recipe) => {
          const unixPublishDateTime = recipe.publishDate as number;
          recipe.publishDate = new Date(unixPublishDateTime * 1000);
        });
      }

    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }

    return fetchedRecipes;
  };

  const handleRecipesPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const recipesPerPage = event.target.value;

    setRecipes([]);
    setRecipesPerPage(+recipesPerPage);
  }

  // const handleLoadMoreRecipesClick = () => {
  //   let lastRecipe, cursorId;
  //   if (recipes && recipes.length > 0) {
  //     lastRecipe = recipes[recipes.length - 1];
  //     cursorId = lastRecipe.id;
  //   }

  //   handleFetchRecipes(cursorId);
  // }

  const handleFetchRecipes = async (cursorId = '') => {
    try {
      const fetchedRecipes = await fetchRecipes(cursorId);
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
      // const response = await FirebaseFirestoreService.createDocument('recipes', newRecipe);

      const response = await FirebaseFirestoreRestService.createDocument('recipes', newRecipe);

      handleFetchRecipes();

      alert(`Succesfully created a recipe with ID = ${response.id}`);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  const handleUpdateRecipe = async (newRecipe: Recipe, recipeId: string) => {
    try {
      // await FirebaseFirestoreService.updateDocument('recipes', recipeId, newRecipe);

      await FirebaseFirestoreRestService.updateDocument('recipes', newRecipe, recipeId);

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
        // await FirebaseFirestoreService.deleteDocument('recipes', recipeId);

        await FirebaseFirestoreRestService.deleteDocument('recipes', recipeId);

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
    const selectedRecipe = recipes?.find((recipe) => {
      return recipe.id === recipeId;
    });

    if (selectedRecipe) {
      setCurrentRecipe(selectedRecipe);
      window.scrollTo(0, document.body.scrollHeight);
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
        <div className='row filters'>
          <label className='recipe-label input-label'>
            Category:
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className='select'
            >
              <option value=''></option>
              <option value='breadSandwichesAndPizza'>Breads, Sandwiches, and Pizza</option>
              <option value='eggsAndBreakfast'>Eggs & Breakfast</option>
              <option value='dessertsAndBakedGoods'>Desserts & Baked Goods</option>
              <option value='fishAndSeafood'>Fish & Sefood</option>
              <option value='vegetables'>Vegetables</option>
            </select>
          </label>
          <label className='input-label'>
            Order By:
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className='select'
            >
              <option value='publishDateDesc'>Publish Date (newest - oldest)</option>
              <option value='publishDateAsc'>Publish Date (oldest - newest)</option>
            </select>
          </label>
        </div>
        <div className='center'>
          <div className='recipe-list-box'>
            {
              isLoading ? (
                <div className='fire'>
                  <div className='flames'>
                    <div className='flame'></div>
                    <div className='flame'></div>
                    <div className='flame'></div>
                    <div className='flame'></div>
                  </div>
                  <div className='logs'></div>
                </div>
              ) : null
            }
            {
              !isLoading && recipes && recipes.length === 0 ? (
                <h5 className='no-recipes'>No Recipes Found</h5>
              ) : null
            }
            {
              !isLoading && recipes && recipes.length > 0 ? (
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
                          <div className='recipe-image-box'>
                            {
                              recipe.imageUrl ? (
                                <img src={recipe.imageUrl} alt={recipe.name} className='recipe-image' />
                              ) : null
                            }
                          </div>
                          <div className='recipe-field'>Category: {lookupCategoryLabel(recipe.category)}</div>
                          <div className='recipe-field'>Publish Date: {formatData(recipe.publishDate as Date)}</div>
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
          isLoading || (recipes && recipes.length > 0) ? (
            <>
              <label className='input-label'>
                Recipes Per Page:
                <select
                  value={recipesPerPage}
                  onChange={handleRecipesPerPageChange}
                  className='select'
                >
                  <option value="3">3</option>
                  <option value="6">6</option>
                  <option value="9">9</option>
                </select>
              </label>
              <div className='pagination'>
                {/* <button
                  type='button'
                  className='primary-button'
                  onClick={handleLoadMoreRecipesClick}
                >
                  LOAD MORE RECIPES
                </button> */}
                <div className='row'>
                  <button 
                    className={ currentPageNumber === 1 
                      ? 'primary-button hidden' 
                      : 'primary-button'
                    } 
                    type='button'
                    onClick={() => setCurrentPageNumber(currentPageNumber - 1)}
                  >Previous</button>
                  <div>Page {currentPageNumber}</div>
                  <button 
                    className={ isLastPage 
                      ? 'primary-button hidden' 
                      : 'primary-button'
                    }
                    type='button'
                    onClick={() => setCurrentPageNumber(currentPageNumber + 1)}
                  >Next</button>
                </div>
                <div className='row'>
                  {
                    !categoryFilter 
                    ? new Array(totalNumberOfPages).fill(0).map((value, index) => {
                      return (
                        <button 
                          key={index + 1} 
                          type='button'
                          className={
                            currentPageNumber === index + 1
                            ? 'selected-page primary-button page-button'
                            : 'primary-button page-button'
                          }
                          onClick={() => setCurrentPageNumber(index + 1)}
                        >
                          { index + 1 }
                        </button>
                      )
                    }) 
                    : null
                  }
                </div>
              </div>
            </>
          ) : null
        }
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
