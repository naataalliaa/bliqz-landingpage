const form = document.getElementById('signupForm');
const message = document.getElementById('message');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();

  if (!name || !email) {
    message.textContent = 'Please fill in both fields.';
    message.style.color = 'red';
    return;
  }

  const formData = new FormData();
  formData.append('entry.393281139', name);      // Name field entry ID
  formData.append('entry.1043843901', email);    // Email field entry ID

  fetch('https://docs.google.com/forms/u/0/d/e/1FAIpQLSejH6rYKMPsPi9qBJx508V6CBHGuYxnn58N-0PvUmlNVsi2qg/formResponse', {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).then(() => {
    message.textContent = 'Thank you for signing up!';
    message.style.color = 'green';
    form.reset();
  }).catch(() => {
    message.textContent = 'Oops! Something went wrong.';
    message.style.color = 'red';
  });
});
