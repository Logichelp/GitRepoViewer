const usernameInput = document.getElementById('usernameInput');
const userDetailsDiv = document.getElementById('userDetails');
const userAvatar = document.getElementById('userAvatar');
const userLink = document.getElementById('userLink');
const userName = document.getElementById('userName');
const userBio = document.getElementById('userBio');
const userLocation = document.getElementById('userLocation');
const repositoryListDiv = document.getElementById('repositoryList');
const errorMessage = document.getElementById('errorMessage');
const loader = document.getElementById('loader');
const paginationDiv = document.getElementById('pagination');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const reposPerPageSelect = document.getElementById('reposPerPage');

let currentPage = 1;
let reposPerPage = 10;

reposPerPageSelect.addEventListener('change', function () {
  reposPerPage = reposPerPageSelect.value;
});

async function getUserDetails() {
  const username = usernameInput.value.trim();

  if (username) {
    showLoader();
    clearUserDetails();
    clearRepositoryList();
    hideErrorMessage();

    try {
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      const userData = await userResponse.json();

      displayUserInfo(userData);

      // Display user bio
      displayUserBio(userData);

      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=${reposPerPage}&page=${currentPage}`);
      const reposData = await reposResponse.json();

      await displayRepositoryList(reposData);

    } catch (error) {
      displayErrorMessage('Error fetching user details.');
      console.error('Error fetching user details:', error);
    } finally {
      hideLoader();
    }
  } else {
    displayErrorMessage('Please enter a GitHub username.');
  }
}

function displayUserInfo(user) {
  userAvatar.src = user.avatar_url;
  userAvatar.alt = `${user.login} Avatar`;
  userLink.href = user.html_url;
  userLink.textContent = user.login;
  userName.textContent = user.name || 'Not specified';
  userLocation.textContent = user.location || 'Not specified';
}

function displayUserBio(user) {
  userBio.textContent = user.bio || 'No bio available';
}

async function displayRepositoryList(repos) {
  if (repos.length > 0) {
    for (const repo of repos) {
      const repoContainer = document.createElement('div');
      repoContainer.classList.add('repo-container');

      const repoName = document.createElement('p');
      repoName.classList.add('repo-name');
      repoName.textContent = `${repo.name}`;
      repoContainer.appendChild(repoName);

      const repoDescription = document.createElement('p');
      repoDescription.textContent = repo.description || 'No description available.';
      repoContainer.appendChild(repoDescription);

      const technologiesList = await getTechnologies(repo.languages_url);

      const technologies = document.createElement('p');
      technologies.classList.add('repo-technologies');

      technologiesList.forEach((tech) => {
        const techSpan = document.createElement('span');
        techSpan.textContent = tech;
        techSpan.classList.add('tech-item');
        technologies.appendChild(techSpan);
      });
      repoContainer.appendChild(technologies);

      repositoryListDiv.appendChild(repoContainer);
    }
  } else {
    const noReposMessage = document.createElement('p');
    noReposMessage.textContent = 'No repositories found.';
    repositoryListDiv.appendChild(noReposMessage);
  }
}

async function getTechnologies(languagesUrl) {
  const response = await fetch(languagesUrl);
  const data = await response.json();
  return Object.keys(data);
}

function clearUserDetails() {
  userAvatar.src = '';
  userAvatar.alt = '';
  userLink.href = '';
  userLink.textContent = '';
  userName.textContent = '';
  userLocation.textContent = '';
  userBio.textContent = '';
}

function clearRepositoryList() {
  repositoryListDiv.innerHTML = '';
}

function displayErrorMessage(message) {
  errorMessage.textContent = message;
}

function hideErrorMessage() {
  errorMessage.textContent = '';
}

function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

function loadPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    getUserDetails();
    updatePaginationInfo();
  }
}

function loadNextPage() {
  currentPage++;
  getUserDetails();
  updatePaginationInfo();
}

function updatePaginationInfo() {
  currentPageSpan.textContent = `Page ${currentPage}`;
}
