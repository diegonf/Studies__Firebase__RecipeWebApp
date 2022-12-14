import { useEffect, useState } from "react";
import React from 'react';
import { Recipe } from "../assets/interfaces";
import ImageUploadPreview from "./ImageUploadPreview";

interface Props {
  existingRecipe: Recipe | null,
  handleAddRecipe: (newRecipe: Recipe) => Promise<void>,
  handleUpdateRecipe: (newRecipe: Recipe, recipeId: string) => Promise<void>,
  handleDeleteRecipe: (recipeId: string) => Promise<void>
  handleEditRecipeCancel: () => void,
}

const AddEditRecipeForm = (props: Props) => {
  const { existingRecipe, handleAddRecipe, handleUpdateRecipe, handleEditRecipeCancel, handleDeleteRecipe } = props;


  useEffect(() => {
    if (existingRecipe) {
      setName(existingRecipe.name);
      setCategory(existingRecipe.category);
      setDirections(existingRecipe.directions);
      if(existingRecipe.publishDate instanceof Date) {
        setPublishDate(existingRecipe.publishDate.toISOString().split('T')[0]);
      }
      setIngredients(existingRecipe.ingredients);
      setImageUrl(existingRecipe.imageUrl);
    } else {
      resetForm();
    }
  }, [existingRecipe]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
  const [directions, setDirections] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientName, setIngredientName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleRecipeFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (ingredients.length === 0) {
      alert('Ingredients cannot be empty. Please add at least 1 ingredient.');
      return;
    }

    if(!imageUrl) {
      alert('Missing recipe image. Please add a recipe image.');
      return;
    }

    const isPublished = new Date(publishDate) <= new Date() ? true : false;

    const newRecipe = {
      name,
      category,
      directions,
      // publishDate: new Date(publishDate),
      publishDate: new Date(publishDate).getTime() / 1000,
      isPublished,
      ingredients,
      imageUrl
    }

    if(existingRecipe){
      handleUpdateRecipe(newRecipe, existingRecipe.id as string);
    } else {
      handleAddRecipe(newRecipe);
    }
    resetForm();
  }

  const handleAddIngredient = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (e.type !== 'click' && (e as React.KeyboardEvent).key !== 'Enter') {
      return;
    }

    e.preventDefault();

    if (!ingredientName) {
      alert('Missing ingredient field. Please double check.');
      return;
    }

    setIngredients([...ingredients, ingredientName]);
    setIngredientName('');
  }

  const handleDeleteIngredient = (ingredientName: string) => {
    const remainingIngredients = ingredients.filter((ingredient) => {
      return ingredient !== ingredientName;
    });

    setIngredients(remainingIngredients);
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setDirections('');
    setPublishDate('');
    setIngredients([]);
    setImageUrl('');
  }

  return (
    <form onSubmit={handleRecipeFormSubmit} className='add-edit-recipe-form-container'>
      {
        existingRecipe ? <h2>Update the Recipe</h2> : <h2>Add a New Recipe</h2>
      }
      <div className='top-form-section'>
        <div className="imagem-input-box">
          Recipe Image
          <ImageUploadPreview
            basePath='recipes'
            existingImageUrl={imageUrl}
            handleUploadFinish={ (downloadUrl: string) => setImageUrl(downloadUrl)}
            handleUploadCancel={() => setImageUrl('')}
          />
        </div>
        <div className='fields'>
          <label className='recipe-label input-label'>
            Recipe Name:
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='input-text'
            />
          </label>
          <label className='recipe-label input-label'>
            Category:
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
          <label className='recipe-label input-label'>
            Directions:
            <textarea
              required
              value={directions}
              onChange={(e) => setDirections(e.target.value)}
              className='input-text directions'
            />
          </label>
          <label className='recipe-label input-label'>
            Publish Date:
            <input
              type="date"
              required
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className='input-text'
            />
          </label>
        </div>
      </div>
      <div className='ingredients-list'>
        <h3 className='text-center'>Ingredients</h3>
        <table className='ingredients-table'>
          <thead>
            <tr>
              <th className='table-header'>Ingredient</th>
              <th className='table-header'>Delete</th>
            </tr>
          </thead>
          <tbody>
            {
              ingredients && ingredients.length > 0 ? ingredients.map((ingredient) => {
                return (
                  <tr key={ingredient}>
                    <td className='table-data text-center'>{ingredient}</td>
                    <td className='ingredient-delete-box'>
                      <button
                        type='button'
                        className='secondary-button ingredient-delete-button'
                        onClick={() => handleDeleteIngredient(ingredient)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              }) : null
            }
          </tbody>
        </table>
        {
          ingredients && ingredients.length === 0 ? (
            <h3 className='text-center no-ingredients'>No Ingredients Added Yet</h3>
          ) : null
        }
        <div className='ingredient-form'>
          <label className='ingredient-label'>
            Ingredient:
            <input
              type="text"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              onKeyDown={handleAddIngredient}
              className='input-text'
              placeholder='ex. 1 cup of sugar'
            />
          </label>
          <button
            type='button'
            className='primary-button add-ingredient-button'
            onClick={handleAddIngredient}
          >
            Add Ingredient
          </button>
        </div>
      </div>
      <div className='action-buttons'>
        <button type='submit' className='primary-button action-button'>
          { existingRecipe ? "Update Recipe" : "Create Recipe" }
        </button>
        {
          existingRecipe ? (
            <>
              <button 
                type="button"
                onClick={handleEditRecipeCancel}
                className='primary-button action-button'
              >Cancel</button>
              <button 
                type="button"
                onClick={() => handleDeleteRecipe(existingRecipe.id as string)}
                className='primary-button action-button'
              >Delete</button>
            </>
          ) : null
        }
      </div>
    </form>
  );
};

export default AddEditRecipeForm;