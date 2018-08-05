var dataArray;

function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);

  if (response.status === 'connected') {
    testAPI();
  } else {
    document.getElementById('status').innerHTML =
      'Please log ' + 'into this app.';
  }
}

function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
  FB.init({
    appId: '296693490877561',
    cookie: true,
    xfbml: true,
    version: 'v3.1'
  });
};

(function(d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');

function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
  });

  FB.api(
    '/1517960644656/photos',
    'GET',
    { fields: 'created_time,source,likes.summary(true)' },
    async function(response) {
      dataArray = [...response.data];
      await fetchPhotos(response.paging.next);

      dataArray.sort(compareLikes);
      console.log(dataArray);

      for (let i of dataArray) {
        if (i.likes.summary.total_count > 1) {
          //format the dates
          var regex = /\d{4}-\d{2}-\d{2}/;
          let date = i.created_time.match(regex)[0];
          document.getElementById('cards').innerHTML += `
              <div class="card">
                <img src="${i.source}" alt="picture">
                <div class="container">
                <h4><b>${date}</b></h4>
                  <p>Likes:${i.likes.summary.total_count + 50}</p>
              </div>
            </div>`;
        }
      }
    }
  );
}

//fetch remaining photos not include in the inital FB query
async function fetchPhotos(url) {
  console.log('FETCHING PHOTOS...');
  let response = await fetch(url);
  var json = await response.json();
  dataArray = [...dataArray, ...json.data];

  if (json.paging.next) {
    await fetchPhotos(json.paging.next);
  }
  return;
}

function compareLikes(a, b) {
  return b.likes.summary.total_count - a.likes.summary.total_count;
}

function compareDates(a, b) {
  let date1 = new Date(a.created_time);
  let date2 = new Date(b.created_time);
  return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
}
