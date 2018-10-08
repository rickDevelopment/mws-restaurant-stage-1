

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }
  
  /*URL to fetch reviews*/
  
  static get REVIEWS_URL(){
    const port = 1337
    return `http://localhost:${port}/reviews/`;
  }

  /* 
  *Fetch all reviews
  */
 static fetchReviews(callback){
   let rurl = DBHelper.REVIEWS_URL;
   fetch(rurl)
   .then( response =>{
     if(!response.ok){
       throw Error(`There was a error fetching reviews data: ${response.statusText}`)
     }
     return response.json();
   })
   .then(reviews =>{
     console.log(`fetched reviews`)
      return callback(null, reviews)
   })
   .catch(error => console.log(`A error has occured: ${error}`));
 }


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let url = DBHelper.DATABASE_URL;
    fetch(url)
    .then(response =>{
      if(!response.ok){
        throw Error(`There was a error fetching data:${response.statusText}`)
      }
      return response.json();
    })
    .then(restaurants =>{
      //Create Transaction for restaurant-idb to add to the database

    DBHelper.dbPromise.then(function(db){
      const tx = db.transaction('restaurants','readwrite');
      const restaurantStore = tx.objectStore('restaurants');
      console.log(' restaurant transaction created')
      //loop through the restaurants and add them to restaurant store
      for(const restaurant of restaurants){
        console.log('adding restaurants to indexedDB')
        restaurantStore.put(restaurant)    
    }
    return tx.complete;
  }).then(function(){
    console.log('added item to the restaurantStore')
  })

      return callback(null,restaurants)
    })
    .catch(error => console.log(`A error as occured: ${error}`));
  }
    /*
    ===Old xhr request that was replaced by the fetch above===

    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
    */

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }
  /**
   * Fetch a reviews by its ID.
   */
  static fetchReviewById(id,callback){
        // fetch all reviews with proper error handling
    DBHelper.fetchReviews((error, reviews) =>{      
      if (error){
        callback(error,null)
      } else {
        const review = reviews.find(r => r.id == id);
        if(review){
          callback(null,review);
        } else{
          callback('Review does not exist', null)
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /* Fetch restaurant reviews*/

  /*static fetchReview(callback){
    //fetch all reviews
    DBHelper.fetchReviews((error,reviews) =>{
      if (error){
        callback(error,null)
      } else{
        console.log(reviews)
      }
    })
  }
*/
  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(!restaurant.photograph){
      restaurant.photograph = '10';
    }
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  // Create indexDB database to cache response\\
 
  /*=================INDEXED DB ==========================*/
  //create indexedDb database to store restaurants
  static get dbPromise(){
    const dbPromise = idb.open('restaurant-idb', 1, function(upgradeDb){
      switch(upgradeDb.oldVersion){
        case 0:
        //create restaurant object store
        let restaurantStore = upgradeDb.createObjectStore('restaurants' , {keyPath:'id'});
       console.log('Restaurant object store created')
       //create ID index
      } 
    } )
    return dbPromise
  }
}
// Test review funcitons

  //Create Transaction for restaurant-idb to add to the database

// let myrestaurants = 
// console.log(`This is the fetch ${}`)

//get all cached items from the database

/*
dbPromise.then(function(db) {
  var tx = db.transaction('store', 'readonly');
  var store = tx.objectStore('store');
  return store.getAll();
}).then(function(items) {
  console.log('Items by name:', items);
});*/