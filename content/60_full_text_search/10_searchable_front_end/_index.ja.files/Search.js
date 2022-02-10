import React, { useState, useReducer } from 'react';

import {API, graphqlOperation } from 'aws-amplify';

import {
  Button,
  TextField,
} from '@material-ui/core';

import PostList from '../components/PostList';
import Sidebar from './Sidebar';

const SUBSCRIPTION = 'SUBSCRIPTION';
const INITIAL_QUERY = 'INITIAL_QUERY';
const ADDITIONAL_QUERY = 'ADDITIONAL_QUERY';

const reducer = (state, action) => {
  switch (action.type) {
    case INITIAL_QUERY:
      return action.posts;
    case ADDITIONAL_QUERY:
      return [...state, ...action.posts]
    case SUBSCRIPTION:
      return [action.post, ...state]
    default:
      return state;
  }
};

export default function Search() {
  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');

  const searchPosts = async (type, nextToken = null) => {
    console.log('searchPosts called: ' + query)
    if (query === '') return;
    const res = await API.graphql(graphqlOperation(searchPostsGql, {
      filter: { content: { matchPhrase: query } },
      limit: 20,
      nextToken: nextToken,
    }));
    console.log(res);
    dispatch({ type: type, posts: res.data.searchPosts.items })
    setNextToken(res.data.searchPosts.nextToken);
    setIsLoading(false);
  }

  const getAdditionalPosts = () => {
    if (nextToken === null) return; //Reached the last page
    searchPosts(ADDITIONAL_QUERY, nextToken);
  }

  const handleChange = event => {
    setQuery(event.target.value);
  };

  return (
    <React.Fragment>
      <Sidebar
        activeListItem='serach'
      />
      <PostList
        isLoading={isLoading}
        posts={posts}
        getAdditionalPosts={getAdditionalPosts}
        listHeaderTitle={'Search'}
        listHeaderTitleButton={
          <React.Fragment>
            <TextField
              label="Enter Keywords"
              multiline
              rowsMax="3"
              variant="filled"
              value={query}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={()=> {searchPosts(INITIAL_QUERY)}}
              fullWidth
            >
              Search
          </Button>
          </React.Fragment>
        }
      />
    </React.Fragment>
  )
}

export const searchPostsGql = /* GraphQL */ `
  query SearchPosts(
    $filter: SearchablePostFilterInput
    $sort: SearchablePostSortInput
    $limit: Int
    $nextToken: String
  ) {
    searchPosts(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        type
        id
        content
        owner
      }
      nextToken
      total
    }
  }
`;