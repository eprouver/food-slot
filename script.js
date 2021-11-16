const contents = {
  "reel-1": [{ type: "title", value: "New", className: 'no-filter' }],
  "reel-2": [{ type: "title", value: "Food", className: 'no-filter' }],
  "reel-3": [{ type: "title", value: "Idea", className: 'no-filter' }]
};

const spinNumber = 30;

let spin;
let isSpinning = false;

const clicks = [
  new Howl({
    src: ['sounds/test.mp3'],
    volume: 0.5,
  }),
  new Howl({
    src: ['sounds/testtwo.mp3'],
    volume: 0.5,
  }),
  new Howl({
    src: ['sounds/testthree.mp3'],
        volume: 0.25,
  })];

let winImage = [];

let voice;
let selectNewVoice = () => {
  let tries = 0;

  voice = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.indexOf('en') > -1);
  voice = voice[new Date%voice.length];

  if (!voice) {
    setTimeout(selectNewVoice, 1000);
  }
}

selectNewVoice();

let say = (m) => {
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance();
  msg.voice = voice;
  msg.volume = 0.25;
  // msg.pitch = 1.1;
  msg.rate = 1.3;
  msg.text = m;
  msg.lang = 'en';
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
          cell.append(
            $("<div>")
              .addClass("title-type")
              .text(adder.value)
          ).addClass(adder.className);
          break;
        case "link":
          const link = $("<a>")
              .addClass("link-type")
              .attr('href', adder.url)
              .attr('target', '_BLANK')
              .text(adder.value);
            cell.append(link);
          break;
        case "img":
          cell.append($("<div>")
              .addClass("img-type")
              .css({ backgroundImage: `url(${adder.value})` })
              .attr('data', adder.text)
              // .on('click', (e) => $(e.target).slideUp().delay().fadeIn()));
          ).data('adder', adder);
          break;
        case "empty":
          cell.addClass('empty-type')
          .css({
            visibility: 'hidden',
          });
          break;
      }
      cell.data("voice", adder.voice);
      spinner.append(cell);
};

const populateReels = () => {
  winImage = [];
  _(contents).forEach((val, id, obj) => {
    // val []
    // id 'reel #'
    // get the last 4 items in each reel;
    const reel = $(`#${id}`);
    const screen = [];
    const index = _(obj).toArray().indexOf(val);

    for (let i = 0; i < 3; i++) {
      const last = reel
        .find(".spinner")
        .children()
        .last();
      last.detach();
      screen.push(last);
    }

    reel.empty().css({
      zIndex: 0,
    });
    let cell;

    const spinner = $("<div>")
      .css({
        pointerEvents: 'none',
      })
      .addClass("spinner")
      .on("transitionend", _.once(() => {
        reel.css({
          zIndex: 2,
        });
        isSpinning = false;
        $('.win-type').remove();

        if (cell && !$(cell).hasClass('empty-type')) {
          $(cell).addClass("animated tada");
          const adder = $(cell).data('adder') || { text: cell.textContent };
          spinner.css({
            pointerEvents: 'auto',
          });
          _.delay(() => {
            _.delay(() => { say(adder.text); }, 500);
            const sfx = clicks[index % clicks.length].play();
            clicks[index % clicks.length].rate(1.5, sfx);
          }, 500);
        }
      }));
    reel.append(spinner);

    screen.forEach(cell => {
      spinner.prepend(cell);
    });

    // add items to each reel
    new Array(spinNumber).fill(0.0, 0, spinNumber).forEach(() => {
      const adder = val[~~(Math.random() * val.length)];
      addCell(adder, spinner);
    });

    cell = spinner.children()[spinNumber + 1];
    if (cell) {
      const adder = $(cell).data('adder') || { text: cell.textContent, link: cell.firstChild.getAttribute('href') };
      winImage.push(adder);
    }
  });

  $('.win-type').remove();
  return winImage;
};

const spinReels = (addExtras = false) => {
  selectNewVoice();
  isSpinning = true;
  $('.flashin').hide();
  $('#info-container').hide();
  $('#spin-links').empty();
  if (spin) {
      spin.play();
  } else {
    spin = new Howl({
      src: ['sounds/click.mp3'],
      volume: 0.15,
    });
  }

  const exData = populateReels();

  if (addExtras && exData) {
    const API_KEY = "AIzaSyCiAvnALpVZq0dUkW4uXMsoprsunUHpDyI";
    let search = exData.map(e => e.text).join(' ');

    $('#spin-links').append($('<h3>').text(exData.map(e => e.text).join(', ').toUpperCase()));
    $('#spin-links').append($('<div>').html(`<strong>${exData[2].text}</strong>: ${exData[2].link}`));

    let url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}
        &part=id&q=${search}&maxResults=1&type=video&relevanceLanguage=en&topicId=/m/02wbm`;

    $('#yt-video').empty().text('no videos found');

    $.ajax({
      method: "GET",
      url: url,
      success: function (data) {
        $('#yt-video').empty()
        // .append($('<a target="_blank">').attr('href', `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`).text(`https://www.youtube.com/watch?v=${data.items[0].id.videoId}`))
        .append($(`<iframe width="560" height="315" src="https://www.youtube.com/embed/${data.items[0].id.videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`))

        $('#spin-links').append($('<div>').html(`<strong>YouTube Video</strong>: https://www.youtube.com/watch?v=${data.items[0].id.videoId}`))
      },
    });

    search = exData.slice(0,2).map(e => e.text).join(' ');
    url = `https://api.edamam.com/api/recipes/v2?q=${search}`;

    const recipes = $('#eda-recipes');
    recipes.empty().text('no recipes found')

    $.ajax({
      method: "GET",
      url: url,
      data: {
        type: 'public',
        q: search,
        random: true,
        app_id: '358d7e38',
        app_key: '07053a1780d2e158fb4e5c30facf71cf'
      },
      headers: {
        'x-rapidapi-host': 'api.edamam.com/api/recipes/v2',
        'x-rapidapi-key': '07053a1780d2e158fb4e5c30facf71cf'
      },
      success: function (data) {
        if(data.hits.length === 0) return;
        recipes.empty();
        data.hits.slice(0,10).forEach(rep => {
          rep = rep.recipe;
          const holder = $('<div>').on('click', () => {
            window.open(rep.url, '_blank');
          }).addClass('new-recipe');

          holder.append($('<div>').text(rep.label).addClass('rec-label'));
          holder.append($('<img>').attr('src', rep.image))
          holder.append($('<div>').text(`Source: ${rep.source}`).addClass('rec-source'))

          recipes.append(holder);

          $('#spin-links').append($('<div>').html(`<strong>${rep.label}</strong>: ${rep.url}`))
        })
      },
      error: function (data) {
        console.error(data);
      },
    });

    _.delay(() => {
      $('#info-container').show(1000);
      recipes.scrollTop(0);
    }, 8000)
  }

  $(".spinner").each((i, spinner) => {
    $(spinner).css({
      transform: `translateY(-${spinner.clientHeight -
        $(".cell").height() * 3}px)`
    });
  });
};

spinReels();


// Populate with images and whatnot
_(['reel-1', 'reel-2']).forEach((id) => {
  contents[id] = [];

  for (let i = 0; i < 20; i++) {
    const file = images[~~(Math.random() * images.length)];
    const url = `./img/${file.trim()}`;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      contents[id].push({
      type: "img",
      value: url,
      text: file.trim().replace('.svg', '').replace(/[0-9]/g, '').replace(/-/g, ' ').trim(),
    });
    }
  }

  // how to add back empty spaces
  // contents['reel-1'].push({ type: "empty", value: "" });
});

  contents['reel-3'] = [];
  for (let i = 0; i < 30; i++) {
    contents['reel-3'].push(links[~~(Math.random() * links.length)]);
  }

  contents['reel-4'] = [];
  contents['reel-4'].push({ type: "title", value: "Guest" });

  contents['reel-4'].push({ type: "text", value: "Dish Battle", className: 'jumping-text' });
  contents['reel-4'].push({ type: "text", value: "Viewer Suggestion" });
