var Wordnik = require('wordnik'),
    parseString = require('xml2js').parseString;

var words = function(dbot) {
    this.commands = {
        '~define': function(event) {
            var query = event.params.slice(1).join(" ");
            this.wn.definitions(encodeURIComponent(query), { useCanonical: true }, function(err, defs) {
                if(!err && defs[0]) {
                    event.reply(dbot.t('def', {
                        'word': query,
                        'definition': defs[0].text
                    }));
                } else {
                    event.reply(dbot.t('no_def', { 'word': query }));
                }
            });
        },

        '~like': function(event) {
            var query = event.params.slice(1).join(" ");
            this.wn.word(encodeURIComponent(query), {}, function(err, word) {
                if(!err && word) {
                    word.related({
                        'limit': 10
                    }, function(err, related) {
                        if(related[0]) {
                            event.reply(dbot.t('def', {
                                'word': 'Words related to ' + query,
                                'definition': related[0].words.join(', ') + '.'
                            }));
                        } else {
                            event.reply(dbot.t('no_similar', { 'word': query }));
                        }
                    });
                } else {
                    event.reply(dbot.t('no_word', { 'word': query }));
                }
            });
        },

        '~example': function(event) {
            var query = event.params.slice(1).join(" ");
            
            this.wn.topExample(encodeURIComponent(query), {}, function(err, example) {
                if(!err && example) {
                    console.log(rep);
                    var rep = new RegExp(query, 'g');
                    event.reply(dbot.t('def', {
                        'word': query + ' example',
                        'definition': example.text.replace(rep, '\u00033'+query+'\u000f')
                    }));
                } else {
                    event.reply(dbot.t('no_example', { 'word': query }));
                }
            });
        },

        '~rw': function(event) {
           this.wn.randomWord(function(err, word) {
                if(!err && word) {
                    this.wn.definitions(encodeURIComponent(word.word), function(err, defs) {
                        if(!err && defs[0]) {
                            if(!defs[0].text.match(/plural/i) && !defs[0].text.match(/participle/i)) {
                                event.reply(dbot.t('def', {
                                    'word': word.word,
                                    'definition': defs[0].text
                                }));
                            } else {
                                dbot.commands['rw'](event);
                            }
                        } else {
                            event.reply(dbot.t('no_def', { 'word': query }));
                        }
                    }.bind(this));
                }
           }.bind(this));
        },

        '~etymology': function(event) {
            var query = event.params[1];
            this.wn.word(query, {}, function(err, word) {
                if(!err && word) { 
                    word.etymologies({},function(err, origin) {
                        if(!err && origin[0]) {
                            parseString(origin[0], function(err, string) {
                                event.reply(dbot.t('origin', {  
                                    'word': query,
                                    'origin': string.ety._
                                }));
                            });
                        } else {
                            event.reply(dbot.t('no_def', { 'word': query }));
                        }
                    });
                } else {
                    event.reply(dbot.t('no_word', { 'word': query }));
                }
            });
        },

        '~jimble': function(event) {
            var word = event.params[1].split('');
            var used = [];
            var jimbled = new Array(word.length);
            for (var i = 0; i < word.length; i++) {
                do {
                    rnd = Math.floor(Math.random()*word.length);
                } while (used.indexOf(rnd) != -1);

                jimbled[i] = word[rnd];
                used.push(rnd);
            }
            event.reply(jimbled.join(''));
        },

        '~merge': function(event) {
            var a = event.params[1]; var b = event.params[2]; event.reply(a.slice(0,_.random(1,a.length)) + b.slice(_.random(b.length-1)));
        }
    };
    this.commands['~jimble'].regex = [/^jimble (.+)$/, 2];

    this.listener = function(event) {
        var matchOne = event.message.match(new RegExp(dbot.config.name + ': should (\\w+) (.+) or (.*)\\?', 'i')); 
        var matchTwo = event.message.match(new RegExp(dbot.config.name + ': should (\\w+) (.+)\\?', 'i'));
        if(matchOne) {
            var pre = matchOne[1];
            if(pre == 'i' || pre == 'I') {
                pre = 'You';
            }

            if(Math.floor(Math.random() * (6)) == 1) {
                dbot.api.quotes.getInterpolatedQuote(event.server, event.channel.name, event.user, 'should_responses', function(q) {
                    event.reply(pre + ' should ' + q);     
                });
            } else {
                event.reply(pre + ' should ' + matchOne[_.random(2, 3)].replace(/,/,'').replace(/should/,''));
            }
        } else if(matchTwo) { // I know i can do it in the one regex shut up
            var pre = matchTwo[1];
            if(pre == 'i' || pre == 'I') {
                pre = 'You';
            }

            if(Math.floor(Math.random() * (6)) == 1) {
                dbot.api.quotes.getInterpolatedQuote(event.server, event.channel.name, event.user, 'should_responses', function(q) {
                    event.reply(pre + ' should ' + q);     
                });
            } else {
                var choice = [ '', 'not '];
                event.reply(pre + ' should ' + choice[_.random(0, 1)] + matchTwo[2].replace(/,/,'').replace(/should/,''));
            }
        }
    };
    this.on = 'PRIVMSG';

    this.onLoad = function() {
        this.wn = new Wordnik({
            'api_key': this.config.api_key
        });
    }.bind(this);
};

exports.fetch = function(dbot) {
    return new words(dbot);
};
