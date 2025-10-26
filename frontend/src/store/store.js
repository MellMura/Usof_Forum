import { configureStore } from '@reduxjs/toolkit';
import { postsReducer } from './reducers/postsReducer';
import { bookmarksReducer } from './reducers/bookmarksReducer';
import { blocksReducer } from './reducers/blocksReducer';
import { commentsReducer } from './reducers/commentsReducer';
import { categoriesReducer } from './reducers/categoriesReducer';
import { profileReducer } from './reducers/profileReducer';
import { searchReducer } from './reducers/searchReducer';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    bookmarks: bookmarksReducer,
    blocks: blocksReducer,
    comments: commentsReducer,
    categories: categoriesReducer,
    profile: profileReducer,
    search: searchReducer
  },
});

export default store;