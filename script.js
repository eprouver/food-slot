// export NODE_TLS_REJECT_UNAUTHORIZED=0

const contents = {
  "reel-1": [{ type: "title", value: "That", className: "no-filter" }],
  "reel-2": [{ type: "title", value: "Food", className: "no-filter" }],
  "reel-3": [{ type: "title", value: "Idea", className: "no-filter" }],
};

zsounds = {
  beep: [0.65, 0, 284, , 0.08, 0.06, , 1.5, , , , , , , , , , 0.5, 0.03, 0.2],
};

playZsounds = (sound) => {
  zzfx(...sound);
};

const recipes = $("#eda-recipes");
const spinNumber = 12;
let revealTimer;

let spin;
let isSpinning = false;

const clicks = [
  new Howl({
    src: ["sounds/try1.wav"],
    volume: 0.25,
  }),
  new Howl({
    src: ["sounds/try2.wav"],
    volume: 0.25,
  }),
  new Howl({
    src: ["sounds/try3.wav"],
    volume: 0.2,
  }),
];

const reveal = new Howl({
  src: ["sounds/swish.wav"],
  volume: 0.5,
});

const spin2 = new Howl({
  src: ["sounds/start.wav"],
  volume: 0.5,
});

const clap = new Howl({
  src: ["sounds/clap2.wav"],
  volume: 0.25,
});

const pick = new Howl({
  src: ["sounds/pick.wav"],
  volume: 0.25,
});

let winImage = [];

let voice;
let selectNewVoice = () => {
  let tries = 0;

  voice = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.indexOf("en") > -1);
  voice = voice[new Date() % voice.length];

  if (!voice) {
    setTimeout(selectNewVoice, 1000);
  }
};

selectNewVoice();

let say = (m) => {
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance();
  msg.voice = voice;
  msg.volume = 0.4;
  msg.rate = 1.3;
  msg.text = m;
  msg.lang = "en";
  speechSynthesis.speak(msg);
};

const addCell = (adder, spinner) => {
  const cell = $("<div>").addClass("cell");
  switch (adder.type) {
    case "text":
      cell.append(
        $("<div>")
          .addClass("text-type")
          .addClass(adder.className)
          .text(adder.value)
      );
      break;
    case "title":
      cell
        .append($("<div>").addClass("title-type").text(adder.value))
        .addClass(adder.className);
      break;
    case "link":
      const link = $("<a>")
        .addClass("link-type")
        .attr("href", adder.url)
        .attr("target", "_BLANK")
        .text(adder.value);
      cell.append(link);
      break;
    case "img":
      cell
        .append(
          $("<div>")
            .addClass("img-type")
            .css({ backgroundImage: `url(${adder.value})` })
            .attr("data", adder.text)
        )
        .data("adder", adder);
      break;
    case "empty":
      cell.addClass("empty-type").css({
        visibility: "hidden",
      });
      break;
  }
  cell.data("voice", adder.voice);
  spinner.append(cell);
};

const populateReels = () => {
  winImage = [];
  const others = [];
  _(contents).forEach((val, id, obj) => {
    const reel = $(`#${id}`);
    const screen = [];
    const index = _(obj).toArray().indexOf(val);

    for (let i = 0; i < 3; i++) {
      const last = reel.find(".spinner").children().last();
      last.detach();
      screen.push(last);
    }

    reel.empty().css({
      zIndex: 0,
    });
    let cell;

    const spinner = $("<div>")
      .css({
        pointerEvents: "none",
      })
      .addClass("spinner")
      .on(
        "transitionend",
        _.once(() => {
          reel.css({
            zIndex: 2,
          });
          isSpinning = false;
          $(".win-type").remove();

          if (cell && !$(cell).hasClass("empty-type")) {
            const adder = $(cell).data("adder") || { text: cell.textContent };
            if (others.indexOf(adder.text) > -1) {
              say("same food, let's re-spin");
              _.delay(() => {
                spinReels(true);
              }, 1700);
              return;
            }
            others.push(adder.text);
            spinner.css({
              pointerEvents: "auto",
            });
            const sfx = clicks[index % clicks.length].play();
            clicks[index % clicks.length].rate(1.5, sfx);
            _.delay(() => {
              $(cell).addClass("animated tada");
              _.delay(() => {
                say(adder.text);
              }, 500);
            }, 100);
          }
        })
      );
    reel.append(spinner);

    screen.forEach((cell) => {
      spinner.prepend(cell);
    });

    // add items to each reel
    new Array(spinNumber).fill(0.0, 0, spinNumber).forEach(() => {
      const adder = val[~~(Math.random() * val.length)];
      addCell(adder, spinner);
    });

    cell = spinner.children()[spinNumber + 1];
    if (cell) {
      const adder = $(cell).data("adder") || {
        text: cell.textContent,
        link: cell.firstChild.getAttribute("href"),
      };
      winImage.push(adder);
    }
  });

  $(".win-type").remove();
  return winImage;
};

let exData;

const fillVideo = () => {
  pick.play();
  const API_KEY = "AIzaSyDZ2uN1epiY9KXT7sI6PwrgsbXU612Hfy4";
  let search = exData.map((e) => e.text).join(" ");

  let url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}
      &part=id&q=${search}&maxResults=1&type=video&relevanceLanguage=en&topicId=/m/02wbm`;

  $("#yt-video").empty().html(`<div class="search">Searching ...</div>`);

  $.ajax({
    method: "GET",
    url: url,
    success: function (data) {
      $("#spin-links").append(
        $("<div>").html(
          `<strong>YouTube Video</strong>: <a href="https://www.youtube.com/watch?v=${data.items[0].id.videoId}" target="_blank">https://www.youtube.com/watch?v=${data.items[0].id.videoId}</a>`
        )
      );

      const ytHolder = document.getElementById("yt-video");
      const ytTarget = document.getElementById("yt-target");
      ytTarget.innerHTML = `<iframe width="${window.innerWidth}" height="${window.innerHeight}" src="https://www.youtube.com/embed/${data.items[0].id.videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      $(ytHolder).hide();
      ytTarget.classList.add("full-height");
      setTimeout(function () {
        document.getElementById("snap-container").scrollTop = 0;
      }, 100);
    },
    error: function (data) {
      console.log(data);
      $("#yt-video").empty().html(data.responseJSON.error.message);
    },
  });
};

const fillRecipes = () => {
  pick.play();

  let search = exData
    .slice(0, 2)
    .map((e) => e.text)
    .join(" ");
  url = `https://api.edamam.com/api/recipes/v2?q=${search}`;

  recipes.empty().html('<div class="search">Searching ...</div>');

  $.ajax({
    method: "GET",
    url: url,
    data: {
      type: "public",
      q: search,
      random: true,
      app_id: "358d7e38",
      app_key: "07053a1780d2e158fb4e5c30facf71cf",
    },
    headers: {
      "x-rapidapi-host": "api.edamam.com/api/recipes/v2",
      "x-rapidapi-key": "07053a1780d2e158fb4e5c30facf71cf",
    },
    success: function (data) {
      if (data.hits.length === 0) return;
      recipes.empty();
      data.hits.slice(0, 10).forEach((rep) => {
        rep = rep.recipe;
        const holder = $("<div>")
          .on("click", () => {
            window.open(rep.url, "_blank");
          })
          .addClass("new-recipe")
          .hide();

        holder.append($("<div>").text(rep.label).addClass("rec-label"));
        holder.append($("<img>").attr("src", rep.image));
        holder.append(
          $("<div>").text(`Source: ${rep.source}`).addClass("rec-source")
        );

        recipes.append(holder);

        $("#spin-links").append(
          $("<div>").html(
            `<strong>${rep.label}</strong>: <a href="${rep.url}" target="_blank">${rep.url}</a>`
          )
        );
      });

      _.delay(() => {
        $(".new-recipe").show();
      }, 500);
    },
    error: function (data) {
      console.error(data);
    },
  });
};

const spinReels = (addExtras = false) => {
  if (revealTimer) {
    clearTimeout(revealTimer);
  }
  const ytTarget = document.getElementById("yt-target");
  ytTarget.innerHTML = "";
  ytTarget.classList.remove("full-height");
  selectNewVoice();
  isSpinning = true;
  $("#yt-video").show();
  $("yt-target").removeClass("full-height");
  $("#board").removeClass("done-done");
  $("#info-container").hide();
  $("#spin-links").empty();
  if (spin) {
    spin.play();
    spin2.play();
    setTimeout(() => {
      function ease(n) {
        return n * (n * 0.9);
      }
      for (let i = 0.25; i < 1; i += 0.06) {
        setTimeout(() => {
          playZsounds(zsounds.beep);
        }, 3400 * ease(i));
      }
    }, 500);
  } else {
    spin = new Howl({
      src: ["sounds/click.mp3"],
      volume: 0.15,
    });
  }

  exData = populateReels();

  if (addExtras && exData) {
    $("#yt-video")
      .empty()
      .append(
        $("<button>")
          .addClass("button")
          .text("Gimme a Video")
          .on("click", fillVideo)
      );
    recipes
      .empty()
      .append(
        $("<button>")
          .addClass("button")
          .text("Gimme Recipes")
          .on("click", fillRecipes)
      );

    $("#spin-links")
      .append(
        $("<h3>").text(
          exData
            .map((e) => e.text)
            .join(", ")
            .toUpperCase()
        )
      )
      .append($("<div>").html(`${exData[2].link}`))
      .append($("<br/>"));

    revealTimer = _.delay(() => {
      $("#info-container").show(1000);
      $("#board").addClass("done-done");
      reveal.play();
      _.delay(() => {
        clap.play();
      }, 970);
    }, 11500);
  }

  $(".spinner").each((i, spinner) => {
    $(spinner).css({
      transform: `translateY(-${
        spinner.clientHeight - $(".cell").height() * 3
      }px)`,
    });
  });
};

spinReels();

// Populate with images and whatnot
_(["reel-1", "reel-2"]).forEach((id) => {
  contents[id] = [];

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const url = `./img/${file.trim()}`;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      contents[id].push({
        type: "img",
        value: url,
        text: file
          .trim()
          .replace(".svg", "")
          .replace(/[0-9]/g, "")
          .replace(/-/g, " ")
          .trim(),
      });
    };
  }
});

contents["reel-3"] = [];
for (let i = 0; i < 30; i++) {
  contents["reel-3"].push(links[~~(Math.random() * links.length)]);
}
