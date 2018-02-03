function Song(data) {
    this.title = data.title;
    this.selected = ko.observable(data.selected);

    this.toggleSelected = function() {
        this.selected(!this.selected());
    }
}
function Playlist(data) {
    this.title = data.title;
    this.songs = data.songs;
    this.selected = ko.observable(data.selected);

    this.toggleSelected = function() {
        this.selected(!this.selected());
    }
}


function SpotifyPlaylistCombinerViewModel() {
    var self = this;

    self.lists = ko.observableArray([]);
    self.selectedPlaylists = ko.computed(function() {
        return ko.utils.arrayFilter(self.lists(), function(list) { return list.selected() });
    });
    self.songs = ko.computed(function() {
        testSongs = [];
        for(var i = 0; i < selectedPlaylists().length; i++) {
            var tmpPlaylist = selectedPlaylists()[i];
            for(var ii = 0; ii < tmpPlaylist.songs.length; ii++) {
                var tmpSong = tmpPlaylist.songs[ii];
                testSongs.push(tmpSong);
            }
        }
        return testSongs;
    });

    self.AddSong = function(song) {
        self.songs.push(song);
    }
    self.selectList = function(list) {
        list.toggleSelected();
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

ko.applyBindings(SpotifyPlaylistCombinerViewModel);