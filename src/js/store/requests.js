// https://dimitrioslytras.com/vue-error-handling/

const SUCCESS_STATUS_CODES = [
  200,
  201
];

export const wrapRequest = fn => (...params) =>
  fn(...params)
    .then(response => {
      if (! SUCCESS_STATUS_CODES.includes(response.status)) {
        throw response;
      }
      return response;
    })
    .catch(error => handleError(error));


const handleError = error => {
  console.log('handleError', error)
  const errorStatus = error ? error.status : error;
  const errorMessage = errorStatus;
  console.error('Request Error:', errorMessage)
  // store.dispatch('populateErrors', errorMessage);
  return error;
};
