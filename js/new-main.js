window.$httpGetParams = function(data) {
  var arr = [];
  for (var param in data) {
    arr.push(encodeURIComponent(param) + "=" + encodeURIComponent(data[param]));
  }
  return arr.join("&");
};

window.$http = function(options) {
  options = options || {};
  options.type = (options.type || "GET").toUpperCase();
  options.dataType = options.dataType || "json";
  if (options.async === undefined) {
    options.async = true;
  }
  var params = window.$httpGetParams(options.data);
  var xhr;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var status = xhr.status;
      if (status >= 200 && status < 300) {
        if (options.dataType === "json") {
          options.success && options.success(JSON.parse(xhr.responseText));
        } else {
          options.success && options.success(xhr.responseText);
        }
      } else {
        options.error && options.error(status);
      }
    }
  };
  if (options.type == "GET") {
    xhr.open("GET", options.url + "?" + params, options.async);
    xhr.send(null);
  } else if (options.type == "POST") {
    xhr.open("POST", options.url, options.async);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(params);
  }
};

var origami = {};

origami.titleChange = function() {
  var origin = document.title;
  var titleTime;
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      document.title = "(つェ⊂)我藏好了哦~ " + origin;
      clearTimeout(titleTime);
    } else {
      document.title = "(*´∇｀*) 被你发现啦~ " + origin;
      titleTime = setTimeout(function() {
        document.title = origin;
      }, 2000);
    }
  });
};

origami.scrollTop = function() {
  let scrollE = function() {
    let el = document.getElementById("scroll-top");
    el.style.transition = "opacity 0.5s";
    if (window.scrollY > 50) {
      el.style.opacity = "1";
    } else {
      el.style.opacity = "0";
    }
  };
  scrollE();
  window.addEventListener("scroll", scrollE);
  document.getElementById("scroll-top").addEventListener("click", function() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
};

origami.scrollChange = function() {
  if (!document.body.classList.contains("home")) return;
  let target =
    document.getElementsByClassName("carousel")[0].clientHeight -
    document.getElementsByClassName("ori-header")[0].clientHeight;
  let scrollE = function() {
    if (window.scrollY >= target) {
      document.body.classList.add("not-car");
    } else {
      document.body.classList.remove("not-car");
    }
  };
  scrollE();
  window.addEventListener("scroll", scrollE);
};

origami.mobileBtn = function() {
  document.getElementById("ori-h-m-btn").addEventListener("click", function() {
    let btn = document.getElementById("ori-h-m-btn");
    let menu = document.getElementById("ori-h-menu");
    let header = document.getElementsByClassName("ori-header")[0];
    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      menu.classList.remove("active");
      header.classList.remove("menu-active");
    } else {
      btn.classList.add("active");
      menu.classList.add("active");
      header.classList.add("menu-active");
    }
  });
};

origami.searchBtn = function() {
  document.getElementById("ori-h-search").addEventListener("click", function() {
    let el = document.getElementsByClassName("ori-search")[0];
    el.style.display = "block";
    document.getElementById("ori-search-input").focus();
    el.style.transition = "opacity 0.5s";
    el.style.opacity = "1";
  });
  document
    .getElementById("ori-h-search-close")
    .addEventListener("click", function() {
      let el = document.getElementsByClassName("ori-search")[0];
      setTimeout(function() {
        el.style.display = "none";
      }, 500);
      el.style.transition = "opacity 0.5s";
      el.style.opacity = "0";
    });
};

origami.realTimeSearch = function() {
  let page = 1;
  let ele = document.getElementById("ori-search-input");
  let listEle = document.getElementById("search-list");
  let timer = null;
  let changeSearchList = function(list) {
    listEle.innerHTML = "";
    list.forEach(function(item) {
      let str = "";
      str += '<article class="card" id="post-' + item.id + '">';
      str += '<div class="card-header post-info">';
      str += '<h2 class="card-title">';
      str += '<a href="' + item.link + '">' + item.title.rendered + "</a>";
      str += "</h2>";
      let d = new Date(item.date);
      let dStr =
        d.getFullYear() + "年" + d.getMonth() + "月" + d.getDate() + "日";
      str +=
        '<div class="card-subtitle text-gray"><time>' + dStr + "</time></div>";
      str += "</div>";
      str += '<div class="card-body">' + item.excerpt.rendered + "</div>";
      str += '<div class="card-footer"><div class="post-tags"></div>';
      str += '<a class="read-more" href="' + item.link + '">阅读更多</a>';
      str += "</div>";
      listEle.innerHTML += str;
    });
  };

  ele.addEventListener("input", function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      if (ele.value == "") {
        listEle.innerHTML = "";
        return;
      }
      $http({
        url: "/wp-json/wp/v2/posts",
        type: "GET",
        dataType: "json",
        data: {
          search: ele.value,
          page: page
        },
        success: function(response) {
          changeSearchList(response);
        },
        error: function(status) {
          console.log("状态码为" + status);
        }
      });
    }, 300);
  });
};

origami.loadComments = function() {
  let isOne = true;
  let postId = document
    .getElementById("comments-container")
    .getAttribute("data-postid");
  let maxPage = 2;
  let pageOut = 1;
  let listEle = document.getElementById("comments-container");
  let changeComments = function(list, lv = 1) {
    let str = "";
    list.forEach(function(item) {
      str +=
        '<div id="comment-' +
        item.comment_ID +
        '" class="comment-lv' +
        lv +
        ' comment">';
      str +=
        '<img class="comment-avatar" src="' +
        item.comment_avatar +
        '" height="64" width="64">';
      str += '<div class="comment-content"><div class="comment-header">';
      if (item.comment_author_url == "") {
        str += '<div class="comment-author">' + item.comment_author + "</div>";
      } else {
        str +=
          '<div class="comment-author"><a href="' +
          item.comment_author_url +
          '">' +
          item.comment_author +
          "</a></div>";
      }
      str += item.comment_mark + "</div>";
      str += '<div class="comment-body">' + item.comment_content + "</div>";
      str += '<div class="comment-footer">';
      str +=
        '<div class="comment-date"><i class="fa fa-clock-o" aria-hidden="true"></i>';
      str += "发表于: <time>" + item.comment_date + "</time></div>";
      str += '<div class="comment-btn"><span title="回复">';
      str += '<i class="fa fa-reply" aria-hidden="true"></i>';
      str +=
        '<a rel="nofollow" class="comment-reply-link" data-commentid="' +
        item.comment_ID +
        '" data-postid="' +
        item.comment_post_ID +
        '" data-belowelement="#comment-' +
        item.comment_ID +
        '" data-respondelement="#respond">回复</a>';
      str += "</span></div></div></div></div>";
      if (item.sub != []) {
        str +=
          '<ul class="comment-children">' +
          changeComments(item.sub, lv + 1) +
          "</ul>";
      }
    });
    return str;
  };
  let load = function(page = pageOut) {
    let loading = document.getElementById("comment-loading");
    loading.style.height = "4rem";
    if (!isOne) {
      window.scrollTo({
        top: loading.offsetTop - 200,
        behavior: "smooth"
      });
    }
    listEle.style.height = "0px";
    if (page <= 0) {
      page = 1;
    }
    if (page > maxPage) {
      page = maxPage;
    }
    let loadF = function() {
      $http({
        url: "/wp-json/origami/v1/comments",
        type: "GET",
        dataType: "json",
        data: {
          id: postId,
          page: page
        },
        success: function(response) {
          loading.style.height = "0";
          listEle.innerHTML = changeComments(response);
          listEle.style.height = listEle.scrollHeight + "px";
          pageOut = page;
        },
        error: function(status) {
          console.log("状态码为" + status);
        }
      });
    };
    if (isOne) {
      loadF();
      isOne = false;
    } else {
      setTimeout(loadF, 600);
    }
  };
  let loadPrev = function() {
    pageOut--;
    load(pageOut);
  };
  let loadNext = function() {
    pageOut++;
    load(pageOut);
  };
  return {
    load: load,
    loadPrev: loadPrev,
    loadNext: loadNext
  };
};

window.addEventListener("load", function() {
  origami.comment = origami.loadComments();
  origami.comment.load();
  origami.titleChange();
  origami.scrollTop();
  origami.scrollChange();
  origami.mobileBtn();
  origami.searchBtn();
  origami.realTimeSearch();
});
