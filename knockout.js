function Song(data) {
    var self = this;
    self.title = data.title;
    self.selected = ko.observable(data.selected);

    self.toggleSelected = function() {
        self.selected(!self.selected());
    }
}
function Playlist(data) {
    var self = this;

    self.title = data.title;
    self.songs = data.songs;
    self.selected = ko.observable(data.selected);

    self.toggleSelected = function() {
        self.selected(!self.selected());
    }
}

function LoginViewModel(parent) {
    var self = this;
    self.loggedIn = ko.observable(false);
    self.username = ko.observable();

    self.loginForm = function() {
        self.loggedIn(true);
        parent.setUser();
    }
}

function SpotifyPlaylistCombinerViewModel() {
    var self = this;

    self.lists = ko.observableArray([]);
    self.songs = ko.computed(function() {
        return _
            .chain(self.lists())
            .filter(function(list) { return list.selected() })
            .map('songs')
            .flatten()
            .sortBy('title')
            .value()
    });

    self.AddSong = function(song) {
        self.songs.push(song);
    }
    self.selectList = function(list) {
        list.toggleSelected();
    }
    self.selectSong = function(song) {
        song.toggleSelected();
    }

    // Get data
    $.getJSON('api.json', function(allData) {
        var mappedTasks = $.map(allData, function(item) {
            return new Playlist({
                title: item.name,
                songs: $.map(item.songs, function(song) { return new Song({ title: song, selected: true }) }),
                selected: false
            })
        });
        self.lists(mappedTasks);
    });
}

function AppViewModel() {
    var self = this;

    self.login = new LoginViewModel(self);
    self.combiner = ko.observable();

    self.setUser = function() {
        self.combiner(new SpotifyPlaylistCombinerViewModel(self.login.username()));
    }

    self.login.loginForm();

}

ko.applyBindings(new AppViewModel());