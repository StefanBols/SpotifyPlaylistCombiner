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
    self.songsCount = data.songsCount;
    self.trackUrl = data.trackUrl;
    self.selected = ko.observable(data.selected);
    
    self.limit = data.limit;
    self.offset = data.offsetlimit;
    self.total = data.total;

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
            .uniq(true, 'title')
            .value()
    });
    self.loadedPlaylists = ko.observable();
    self.availablePlaylists = ko.observable();

    self.AddSong = function(song) {
        self.songs.push(song);
    }
    self.selectList = function(list) {
        $.ajax(list.trackUrl + '?fields=total%2Climit%2Coffset%2Cnext%2Cprev%2Citems(track(artists(name)%2C%20name%2C%20id))&limit=100', {
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer BQCnmx-cgeB7s_l16BgnlEGe8-QAomk8OXKT4QFIk1hyaNNqpfKmh16Wc2pZ-vVT1KL7DX6_cfuYEUOBfl2__ER7-Q_JPYCXV-jRLx1At-K_NtLODO2uqe7wbdw2UtZdbtukiHTsJcCd_A5bEJiLYVhHgcG_'
            },
            success: function(r) {
                console.log(r);
                list.limit = r.limit;
                list.offset = r.offsetlimit;
                list.total = r.total;
                var mappedTasks = _.map(r.items, function(item) {
                    return new Song({
                        title: item.track.name,
                        selected: true
                    })
                });
                list.songs = mappedTasks;

                list.toggleSelected();
            }
        });
    }
    self.selectSong = function(song) {
        song.toggleSelected();
    }

    // // Get data
    // $.getJSON('api.json', function(allData) {
    //     var mappedTasks = $.map(allData, function(item) {
    //         return new Playlist({
    //             title: item.name,
    //             songs: $.map(item.songs, function(song) { return new Song({ title: song, selected: true }) }),
    //             songsCount: item.songs.length,
    //             selected: false
    //         })
    //     });
    //     self.lists(mappedTasks);
    // });

    $.ajax('https://api.spotify.com/v1/me/playlists?limit=50', {
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer BQDxL8tolIEZEzBuEw1AnLVmcY-NjGeZQdHBqa_gBJHdyi100SrohCtpourXo-hv1SdwIQPcBZ4NlP0dgXEhqk6fiHUZnyKQjQRAAXtzwwDDBnD0g8V7D5YKf1mQAy2twowLNfnfvVMoMMlIGP7DXaQvNKB6'
        },
        success: function(r) {
            console.log(r);
            self.loadedPlaylists(r.items.length);
            self.availablePlaylists(r.total);
            var mappedTasks = $.map(r.items, function(item) {
                return new Playlist({
                    title: item.name,
                    //songs: $.map(item.songs, function(song) { return new Song({ title: song, selected: true }) }),
                    songsCount: item.tracks.total,
                    selected: false,
                    trackUrl: item.tracks.href
                })
            });
            self.lists(mappedTasks);
        }
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