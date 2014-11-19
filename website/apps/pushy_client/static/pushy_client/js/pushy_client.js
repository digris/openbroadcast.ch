PushyClientApp = function() {

	var self = this;

	this.socket_url;
	this.socket;
	this.debug = false;
	this.subscriptions = [];

	this.init = function() {

		if(self.debug){
			console.debug('PushyClientApp - init');
		}
		setTimeout(function(){
			self.connect()
		}, 100);
	};
	
	this.connect = function() {

		try {
			self.socket = io.connect(self.socket_url);
			self.socket.on('push', function(channel, data) {
				if(self.debug){
					console.debug('PushyClientApp - push:', 'channel:', channel, 'data:', data);
				}
				self.trigger(channel, data);
			});
            if(self.debug){
                console.debug('PushyClientApp - connected');
            }
		} catch(err) {
			console.warning(err.message);
		}
	};
	
	this.subscribe = function(channel, callback) {
		if(self.debug){
			console.debug('PushyClientApp - subscribe:', channel);
		}
		this.subscriptions.push({
			channel: channel,
			callback: callback
		});
	};
	
	this.trigger = function(channel, data) {
		for(i in self.subscriptions) {
			if(channel.endsWith(self.subscriptions[i].channel)) {
                if(self.debug) {
                    console.debug('PushyClientApp - match for "' + channel + '" - call callback function');
                }
				self.subscriptions[i].callback(data);
			}
		};
	};
}; 	
