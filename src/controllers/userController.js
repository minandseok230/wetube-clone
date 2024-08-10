import User from "../models/User";
import bcrypt from "bcrypt";

// 사용자가 가입된다. (Get)
export const getJoin = (req, res) => {
  return res.render("view_user/join", { pageTitle: "Join" });
};

// 사용자가 가입된다. (Post)
export const postJoin = async (req, res) => {
  const pageTitle = "Join";
  const { username, email, password, password2, name } = req.body;
  // email, username 중복 체크
  const exists = await User.exists({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(400).render("view_user/join", {
      pageTitle,
      errorMessage: "This Email/User is already exists.",
    });
  }
  // 비밀번호 확인
  if (password !== password2) {
    return res.status(400).render("view_user/join", {
      pageTitle,
      errorMessage: "Password does not match.",
    });
  }
  // User 문서 생성
  try {
    await User.create({
      email,
      username,
      password,
      name,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("view_user/join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

// 사용자가 로그인 된다. (Get)
export const getLogin = (req, res) => {
  return res.render("view_user/login", { pageTitle: "Login" });
};

// 사용자가 로그인 된다. (Post)
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  const pageTitle = "Login";
  // 사용자 이름 체크
  if (!user) {
    return res.status(400).render("view_user/login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  // 비밀번호 체크
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("view_user/login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  // 세션 초기화(세션에 정보 추가)
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

// 사용자가 깃허브로 로그인 된다. (Get)
export const githubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENTID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

// 사용자가 깃허브로 로그인 된다. (Callback)
export const githubLoginCallback = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENTID,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    // user data
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // email data
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // email 조건 체크
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    // DB의 email과 체크
    let user = await User.findOne({ email: emailObj.email });
    // DB에 동일한 email이 없다면 비밀번호 없이 깃 허브 이메일로만 로그인 된다.
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        email: emailObj.email,
        username: userData.login,
        password: "",
        name: userData.name,
        // 깃 허브로만 로그인 된다는 표시
        socialOnly: true,
      });
    }
    // DB에 동일한 email이 존재한다면 동일한 이메일로 깃허브 로그인이 된다.
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

// 사용자가 로그아웃 된다.
export const logout = (req, res) => {
  // 세션 파괴
  req.session.destroy();
  // req.flash("info", "Bye Bye");
  return res.redirect("/");
};

// 사용자의 프로필이 보여진다.
export const profile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  res.render("view_user/profile", { pageTitle: user.username, user });
};

// 사용자의 프로필이 수정된다. (Get)
export const getEditProfile = (req, res) => {
  return res.render("view_user/edit-profile", { pageTitle: "Edit Profile" });
};

// 사용자의 프로필이 수정된다. (Post)
export const postEditProfile = async (req, res) => {
  const {
    // 로그인된 유저 id.
    session: {
      user: { _id, avatarUrl },
    },
    // 폼에서 데이터 가져오기.
    body: { name, email, username },
    file,
  } = req;
  // ********** Todo: username, email 중복 체크. **********
  // DB에 업데이트
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
    },
    { new: true }
  );
  // Session에 업데이트
  req.session.user = updatedUser;
  return res.redirect("/user/edit");
};

// 사용자의 비밀번호가 수정된다. (Get)
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    // req.flash("error", "Can't change password.");
    return res.redirect("/");
  }
  return res.render("view_user/change-password", {
    pageTitle: "Change Password",
  });
};

// 사용자의 비밀번호가 수정된다. (Post)
export const postChangePassword = async (req, res) => {
  const {
    // 로그인된 유저 id.
    session: {
      user: { _id },
    },
    // 폼에서 데이터 가져오기.
    body: { currentPw, newPw, newPwConfirmation },
  } = req;
  // 현재 비밀번호 체크
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(currentPw, user.password);
  if (!ok) {
    return res.status(400).render("view_user/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  // 새로운 비밀번호 일치 체크
  if (newPw !== newPwConfirmation) {
    return res.status(400).render("view_user/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match.",
    });
  }
  // 비밀번호 업데이트
  user.password = newPw;
  await user.save();
  // req.flash("info", "Password updated");
  return res.redirect("/user/logout");
};
