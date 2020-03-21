const contents = {
  "reel-1": [{ type: "title", value: "Awesome" }],
  "reel-2": [{ type: "title", value: "Food" }],
  "reel-3": [{ type: "title", value: "Idea" }],
  "reel-4": [{ type: "title", value: "Generator" }]
};

const spinNumber = 100;

let spin;

const start = new Howl({
    src: ['sounds/roll.mp3'],
    volume: 0.25,
  });

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
  }), 
  new Howl({
    src: ['sounds/testfour.mp3']
})];

const populateReels = () => {
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

    const spinner = $("<div>")
      .css({
        pointerEvents: 'none',
      })
      .addClass("spinner")
      .on("transitionend", _.once(() => {
        reel.css({
          zIndex: 2,
        });
        const cell = spinner.children()[spinNumber + 1];
        if (cell && !$(cell).hasClass('empty-type')) {
          $(cell).addClass("animated bounce");
          spinner.css({
            pointerEvents: 'auto',
          });
          _.delay(() => {
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
    for (let i = 0; i < spinNumber; i++) {
      const adder = val[~~(Math.random() * val.length)];
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
          );
          break;
        case "link":
            cell.append($("<a>")
              .addClass("link-type")
              .attr('href', adder.url)
              .attr('target', '_BLANK')
              .text(adder.value));    
          break;
        case "img":
          cell.append(
            $("<div>")
              .addClass("img-type")
              .css({ backgroundImage: `url(${adder.value})` })
              .attr('data', adder.text)
              // .on('click', (e) => $(e.target).slideUp().delay().fadeIn())
          );
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
    }
  });
};

const spinReels = () => {
  if (spin) {
      spin.play();
  } else {
    spin = new Howl({
      src: ['sounds/click.mp3']
    });
  }
  
  start.play();

  $(".heartBeat").removeClass("heartBeat");
  populateReels();
  $(".spinner").each((i, spinner) => {
    $(spinner).css({
      transform: `translateY(-${spinner.clientHeight -
        $(".cell").height() * 3}px)`
    });
  });
};

spinReels();

_.delay(() => {
  clicks.forEach(c => c.play());
}, 8000);


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
  
  contents['reel-1'].push({ type: "empty", value: "" });
  contents['reel-2'].push({ type: "empty", value: "" });
});

  contents['reel-3'] = [];
  for (let i = 0; i < 30; i++) {
    contents['reel-3'].push(links[~~(Math.random() * links.length)]);
  }
  
  contents['reel-4'] = [];
  contents['reel-4'].push({ type: "title", value: "Guest" });
  contents['reel-4'].push({ type: "empty", value: "" });
  contents['reel-4'].push({ type: "empty", value: "" });
  contents['reel-4'].push({ type: "empty", value: "" });
  // contents['reel-4'].push({ type: "text", value: "Mini Game", className: 'title-type' });
  contents['reel-4'].push({ type: "text", value: "Dish Battle", className: 'jumping-text' });
  contents['reel-4'].push({ type: "text", value: "Viewer Suggestion" });
  
  contents['reel-1'].push({ type: "empty", value: "" });
  contents['reel-2'].push({ type: "empty", value: "" });
  contents['reel-3'].push({ type: "empty", value: "" });
  contents['reel-4'].push({ type: "empty", value: "" });