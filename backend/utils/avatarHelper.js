const getAvatarUrl = (username) => {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;
};

const getAvatarImgTag = (avatarUrl) => {
  return `<img src="${avatarUrl}" alt="avatar" width="100" height="100" />`;
};

module.exports = { getAvatarUrl, getAvatarImgTag };