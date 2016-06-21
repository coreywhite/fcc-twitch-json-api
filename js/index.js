const ENDPOINT_CHANNELS = 'https://api.twitch.tv/kraken/channels/';
const ENDPOINT_STREAMS = 'https://api.twitch.tv/kraken/streams/';
const PLACEHOLDER_URL = 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Male-question.svg';

var channelList = ["freecodecamp", "ESL_SC2", "OgamingSC2", "cretetion", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "brunofin", "comster404"];

function Channel(name) {
  this.name = name;
  this.url = null;
  this.status = null;
  this.stream = null;
  this.logo = null;
  this.$element = null;
}
Channel.prototype = {
  constructor: Channel,
  setElement: function($element) {
    this.$element = $element;
  },
  fetchStreamData: function() {
    var self = this;
    $.getJSON(ENDPOINT_STREAMS + self.name + '?callback=?', function(data) {
      self.updateStreamData(data);
    });
  },
  fetchChannelData: function() {
    var self = this;
    $.getJSON(ENDPOINT_CHANNELS + self.name + '?callback=?', function(data) {
      self.updateChannelData(data);
    }).fail(function() {
      self.updateChannelData({
        status: 'Twitch API unavailable'
      });
    });
  },
  updateStreamData: function(data) {
    if (data.stream) {
      this.stream = data.stream;
      this.updateChannelData(data.stream.channel);
    } else {
      this.fetchChannelData();
    }
  },
  updateChannelData: function(data) {
    if (data.error) {
      this.status = 'Account closed or invalid';
    } else {
      this.name = data.display_name || this.name;
      this.url = data.url || this.url;
      this.logo = data.logo || this.logo;
      this.status = data.status || this.status;
    }
    this.render();
  },
  render: function($newElement) {
    if ($newElement) {
      this.setElement($newElement);
    }
    if (this.$element) {
      this.$element.empty();
      this.$element.addClass('clearfix');
      this.$element.attr('href', this.url || '#');
      if (this.stream) {
        this.$element.addClass('online');
        this.$element.append($('<p></p>').addClass('callout').text('Online Now'));
      } else {
        this.$element.removeClass('online');
        this.$element.append($('<p></p>').addClass('callout failure').text('Offline'));
      }
      this.$element.append($("<img/>").attr("src", this.logo || PLACEHOLDER_URL).addClass("img-rounded pull-left"));
      this.$element.append($("<h4></h4>").addClass("list-group-item-heading").text(this.name));
      if(this.status) {
        this.$element.append($("<p></p>").addClass("list-group-item-text").text(this.status));
      }
    }
  }
}

function ChannelManager(channelList, $element) {
  this.channelList = channelList;
  this.$element = $element;
  this.channels = this.initChannels();
}
ChannelManager.prototype = {
  constructor: ChannelManager,
  initChannels: function() {
    return this.channelList.map(function(ch) {
      return new Channel(ch);
    });
  },
  fetchChannels() {
    for (var i = 0; i < this.channels.length; i++) {
      this.channels[i].fetchStreamData();
    }
  },
  render() {
    this.$element.empty();
    for (var i = 0; i < this.channels.length; i++) {
      this.channels[i].render($("<a></a>").addClass("list-group-item channel"));
      this.$element.append(this.channels[i].$element);
    }
  }
};

function setBackground() {
  var pattern = Trianglify({
    cell_size: 50,
    variance: 0.5,
    x_colors: 'Purples',
    y_colors: 'match_x',
    palette: Trianglify.colorbrewer,
    stroke_width: 1.51,
  });
  var svgString = new XMLSerializer().serializeToString(pattern.svg());
  var svg64 = window.btoa(svgString);
  $('body').css({
    'background': 'url("data:image/svg+xml;base64,' + svg64 + '") no-repeat center center fixed',
    'background-size': 'cover'
  });
}

$('.filters button').click(function() {
  $('.filters button').removeClass("active");
  $(this).addClass("active");
  if ($(this).attr('id') === 'filter-online') {
    $('.channel').filter('.online').fadeIn(300);
    $('.channel').not('.online').hide();
  } else if ($(this).attr('id') === 'filter-offline') {
    $('.channel').not('.online').fadeIn(300);
    $('.channel').filter('.online').hide();
  } else {
    $('.channel').fadeIn(300);
  }
});

$(document).ready(function() {
  var ch = new ChannelManager(channelList, $(".streamers"));
  ch.fetchChannels();
  ch.render();
  setBackground();
});