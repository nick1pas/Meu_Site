/*!
 * jQuery Migrate - v1.4.1 - 19-05-2016
 * Copyright jQuery Foundation e outros colaboradores
 */
(function( jQuery, janela, undefined ) {
// Veja http://bugs.jquery.com/ticket/13335
// "usar estrito";


jQuery.migrateVersion = "1.4.1";


var alertou sobre = {};

// Lista de avisos já dados; público somente leitura
jQuery.migrateWarnings = [];

// Defina como true para evitar a saída do console; migrateWarnings ainda mantido
// jQuery.migrateMute = false;

// Mostra uma mensagem no console para que os desenvolvedores saibam que estamos ativos
if ( window.console && window.console.log ) {
	window.console.log( "JQMIGRATE: Migrate está instalado" +
		( jQuery.migrateMute ? "" : "com log ativo") +
		", versão " + jQuery.migrateVersion );
}

// Defina como false para desabilitar os rastreamentos que aparecem com avisos
if ( jQuery.migrateTrace === undefined ) {
	jQuery.migrateTrace = true;
}

// Esqueça os avisos que já demos; público
jQuery.migrateReset = function() {
	advertido sobre = {};
	jQuery.migrateWarnings.length = 0;
};

função migrateWarn( msg) {
	var console = janela.console;
	if ( !warnedAbout[ msg ] ) {
		warningAbout[ msg ] = true;
		jQuery.migrateWarnings.push( msg );
		if ( console && console.warn && !jQuery.migrateMute ) {
			console.warn( "JQMIGRATE: " + msg );
			if ( jQuery.migrateTrace && console.trace ) {
				console.trace();
			}
		}
	}
}

function migrateWarnProp( obj, prop, valor, msg ) {
	if ( Object.defineProperty ) {
		// Em navegadores ES5 (não-oldIE), avisar se o código tentar obter prop;
		// permite que a propriedade seja sobrescrita caso algum outro plugin queira
		tentar {
			Object.defineProperty( obj, prop, {
				configurável: verdadeiro,
				enumerável: verdadeiro,
				obter: função(){
					migrateWarn( msg );
					valor de retorno;
				},
				set: function(novoValor){
					migrateWarn( msg );
					valor = novoValor;
				}
			});
			Retorna;
		} pegar(erro) {
			// IE8 é uma droga sobre Object.defineProperty, não posso avisar lá
		}
	}

	// Navegador não ES5 (ou quebrado); basta definir a propriedade
	jQuery._definePropertyBroken = true;
	obj[prop] = valor;
}

if ( document.compatMode === "BackCompat" ) {
	// jQuery nunca suportou ou testou o Modo Quirks
	migrateWarn( "jQuery não é compatível com o Modo Quirks" );
}


var attrFn = jQuery( "<input/>", { size: 1 } ).attr("size") && jQuery.attrFn,
	oldAttr = jQuery.attr,
	valueAttrGet = jQuery.attrHooks.value && jQuery.attrHooks.value.get ||
		function() { return null; },
	valueAttrSet = jQuery.attrHooks.value && jQuery.attrHooks.value.set ||
		function() { return indefinido; },
	rnoType = /^(?:input|button)$/i,
	rnoAttrNodeType = /^[238]$/,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	ruseDefault = /^(?:marcado|selecionado)$/i;

// jQuery.attrFn
migrateWarnProp( jQuery, "attrFn", attrFn || {}, "jQuery.attrFn está obsoleto" );

jQuery.attr = function(elem, name, value, pass) {
	var lowerName = name.toLowerCase(),
		nType = elem && elem.nodeType;

	se (passar) {
		// Como pass é usado internamente, apenas avisamos para novos jQuery
		// versões onde não há um argumento de passagem nos parâmetros formais
		if ( oldAttr.length < 4 ) {
			migrateWarn("jQuery.fn.attr(props, pass ) está obsoleto");
		}
		if ( elem && !rnoAttrNodeType.test( nType ) &&
			(attrFn ? nome em attrFn : jQuery.isFunction(jQuery.fn[nome])) ) {
			return jQuery(elem)[nome](valor);
		}
	}

	// Avisa se o usuário tentar definir `type`, pois ele quebra no IE 6/7/8; verificando
	// para elementos desconectados não avisamos em $( "<button>", { type: "button" } ).
	if ( nome === "tipo" && valor !== indefinido && rnoType.test( elem.nodeName ) && elem.parentNode ) {
		migrateWarn("Não é possível alterar o 'tipo' de uma entrada ou botão no IE 6/7/8");
	}

	// Restaura boolHook para sincronização de propriedade/atributo booleano
	if ( !jQuery.attrHooks[ lowerName ] && rboolean.test( lowerName ) ) {
		jQuery.attrHooks[ lowerName ] = {
			get: function(elem, nome) {
				// Alinha os atributos booleanos com as propriedades correspondentes
				// Retorna à presença do atributo onde alguns booleanos não são suportados
				var attrNode,
					propriedade = jQuery.prop(elem, nome);
				propriedade de retorno === verdadeiro || propriedade typeof !== "boolean" &&
					( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?

					name.toLowerCase() :
					Indefinido;
			},
			set: function(elem, valor, nome) {
				var propName;
				if ( valor === falso ) {
					// Remove os atributos booleanos quando configurados como false
					jQuery.removeAttr(elem, nome);
				} senão {
					// valor é true pois sabemos que neste ponto é do tipo boolean e não false
					// Defina os atributos booleanos com o mesmo nome e defina a propriedade DOM
					propName = jQuery.propFix[ nome ] || nome;
					if (propName in elem) {
						// Apenas defina o IDL especificamente se ele já existir no elemento
						elem[propName] = true;
					}

					elem.setAttribute( nome, nome.toLowerCase() );
				}
				nome de retorno;
			}
		};

		// Avisa apenas para atributos que podem permanecer distintos de suas propriedades pós-1.9
		if (ruseDefault.test( lowerName ) ) {
			migrateWarn( "jQuery.fn.attr('" + lowerName + "') pode usar propriedade em vez de atributo" );
		}
	}

	return oldAttr.call( jQuery, elem, nome, valor );
};

// attrHooks: valor
jQuery.attrHooks.value = {
	get: function(elem, nome) {
		var nodeName = ( elem.nodeName || "" ).toLowerCase();
		if ( nodeName === "botão" ) {
			return valueAttrGet.apply( this, arguments );
		}
		if ( nodeName !== "input" && nodeName !== "opção" ) {
			migrateWarn("jQuery.fn.attr('value') não obtém mais propriedades");
		}
		retornar nome em elem?
			valor.elem:
			nulo;
	},
	set: function(elem, valor){
		var nodeName = ( elem.nodeName || "" ).toLowerCase();
		if ( nodeName === "botão" ) {
			return valueAttrSet.apply( this, arguments );
		}
		if ( nodeName !== "input" && nodeName !== "opção" ) {
			migrateWarn("jQuery.fn.attr('value', val) não define mais propriedades");
		}
		// Não retorna para que setAttribute também seja usado
		valor.elem = valor;
	}
};


var correspondido, navegador,
	oldInit = jQuery.fn.init,
	oldFind = jQuery.find,
	oldParseJSON = jQuery.parseJSON,
	rspaceAngle = /^\s*</,
	rattrHashTest = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]* )\s*\]/,
	rattrHashGlob = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]* )\s*\]/g,
	// Nota: A verificação de XSS é feita abaixo após a string ser cortada
	rquickExpr = /^([^<]*)(<[\w\W]+>)([^>]*)$/;

// $(html) "parece html" mudança de regra
jQuery.fn.init = function( seletor, contexto, rootjQuery ) {
	var match, ret;

	if ( seletor && typeof seletor === "string" ) {
		if ( !jQuery.isPlainObject( context ) &&
				(match = rquickExpr.exec( jQuery.trim( selector ) )) && match[ 0 ] ) {

			// Esta é uma string HTML de acordo com as regras "antigas"; ainda é?
			if (!rspaceAngle.test(seletor)) {
				migrateWarn("$(html) strings HTML devem começar com o caractere '<'");
			}
			if ( corresponde [ 3 ] ) {
				migrateWarn("$(html) texto HTML após a última tag ser ignorada");
			}

			// Rejeite consistentemente qualquer string semelhante a HTML começando com um hash (gh-9521)
			// Note que isso pode quebrar o código jQuery 1.6.x que de outra forma funcionaria.
			if ( match[ 0 ].charAt( 0 ) === "#" ) {
				migrateWarn("A string HTML não pode começar com um caractere '#'");
				jQuery.error("JQMIGRATE: Sequência de seleção inválida (XSS)");
			}

			// Agora processa usando regras soltas; deixe o pré-1.8 jogar também
			// Este é um contexto jQuery? parseHTML espera um elemento DOM (#178)
			if ( context && context.context && context.context.nodeType ) {
				contexto = contexto.contexto;
			}

			if ( jQuery.parseHTML ) {
				return oldInit.call( this,
						jQuery.parseHTML( match[ 2 ], context && context.ownerDocument ||
							contexto || document, true ), context, rootjQuery );
			}
		}
	}

	ret = oldInit.apply( this, argumentos );

	// Preencha as propriedades do seletor e do contexto para que .live() funcione
	if ( seletor && seletor.seletor !== undefined ) {
		// Um ​​objeto jQuery, copie suas propriedades
		ret.seletor = seletor.seletor;
		ret.contexto = seletor.contexto;

	} senão {
		ret.selector = typeof selector === "string" ? seletor: "";
		if (seletor) {
			ret.context = selector.nodeType? seletor: contexto || documento;
		}
	}

	retorno ret;
};
jQuery.fn.init.prototype = jQuery.fn;

jQuery.find = function(seletor) {
	var args = Array.prototype.slice.call( argumentos );

	// Suporte: PhantomJS 1.x
	// String#match falha quando usado com um //g RegExp, apenas em algumas strings
	if ( typeof selector === "string" && rattrHashTest.test( selector ) ) {

		// O hash unquoted não padrão e não documentado foi removido no jQuery 1.12.0
		// Primeiro veja se o qS acha que é um seletor válido, se sim evite um falso positivo
		tentar {
			document.querySelector(seletor);
		} pegar (err1) {

			// Não *parecia* válido para qSA, avise e tente citar o que achamos ser o valor
			selector = selector.replace( rattrHashGlob, function( _, attr, op, value ) {
				return "[" + attr + op + "\"" + valor + "\"]";
			});

			// Se o regexp *pode* ter criado um seletor inválido, não o atualize
			// Observe que pode haver alarmes falsos se o seletor usar extensões jQuery
			tentar {
				document.querySelector(seletor);
				migrateWarn( "Seletor de atributo com '#' deve ser citado: " + args[ 0 ] );
				args[ 0 ] = seletor;
			} pegar (err2) {
				migrateWarn( "Seletor de atributo com '#' não foi corrigido: " + args[ 0 ] );
			}
		}
	}

	return oldFind.apply( this, args );
};

// Copia as propriedades anexadas ao método jQuery.find original (por exemplo, .attr, .isXML)
var findProp;
for ( findProp em oldFind ) {
	if ( Object.prototype.hasOwnProperty.call( oldFind, findProp ) ) {
		jQuery.find[ findProp ] = oldFind[ findProp ];
	}
}

// Deixa $.parseJSON(falsy_value) retornar nulo
jQuery.parseJSON = function(json) {
	if (!json) {
		migrateWarn("jQuery.parseJSON requer uma string JSON válida");
		retornar nulo;
	}
	return oldParseJSON.apply( this, arguments );
};

jQuery.uaMatch = function(ua) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*versão|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatível") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	Retorna {
		navegador: match[ 1 ] || "",
		versão: match[ 2 ] || "0"
	};
};

// Não destrua nenhum jQuery.browser existente caso seja diferente
if (!jQuery.browser) {
	correspondido = jQuery.uaMatch(navigator.userAgent);
	navegador = {};

	if ( matched.browser ) {
		browser[ matched.browser ] = true;
		browser.version = matched.version;
	}

	// Chrome é Webkit, mas Webkit também é Safari.
	if (browser.chrome) {
		navegador.webkit = true;
	} else if (browser.webkit) {
		navegador.safari = true;
	}

	jQuery.browser = navegador;
}

// Avisa se o código tenta obter jQuery.browser
migrateWarnProp( jQuery, "navegador", jQuery.browser, "jQuery.browser está obsoleto" );

// jQuery.boxModel obsoleto em 1.3, jQuery.support.boxModel obsoleto em 1.7
jQuery.boxModel = jQuery.support.boxModel = (document.compatMode === "CSS1Compat");
migrateWarnProp( jQuery, "boxModel", jQuery.boxModel, "jQuery.boxModel está obsoleto" );
migrateWarnProp( jQuery.support, "boxModel", jQuery.support.boxModel, "jQuery.support.boxModel está obsoleto" );

jQuery.sub = function() {
	function jQuerySub(seletor, contexto) {
		return new jQuerySub.fn.init(seletor, contexto);
	}
	jQuery.extend( true, jQuerySub, this );
	jQuerySub.superclass = this;
	jQuerySub.fn = jQuerySub.prototype = this();
	jQuerySub.fn.constructor = jQuerySub;
	jQuerySub.sub = this.sub;
	jQuerySub.fn.init = function init(seletor, contexto) {
		var instância = jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		retornar instância instanceof jQuerySub ?
			instância :
			jQuerySub(instância);
	};
	jQuerySub.fn.init.prototype = jQuerySub.fn;
	var rootjQuerySub = jQuerySub(document);
	migrateWarn( "jQuery.sub() está obsoleto" );
	return jQuerySub;
};

// O número de elementos contidos no conjunto de elementos correspondentes
jQuery.fn.size = function() {
	migrateWarn( "jQuery.fn.size() está obsoleto; use a propriedade .length" );
	retorne este.comprimento;
};


var internalSwapCall = false;

// Se esta versão do jQuery tiver .swap(), não dê alarme falso em usos internos
if (jQuery.swap) {
	jQuery.each( [ "altura", "largura", "reliableMarginRight" ], function( _, name ) {
		var oldHook = jQuery.cssHooks[ nome ] && jQuery.cssHooks[ nome ].get;

		if (antigoHook) {
			jQuery.cssHooks[ nome ].get = function() {
				var ret;

				internalSwapCall = verdadeiro;
				ret = oldHook.apply( this, argumentos );
				internalSwapCall = false;
				retorno ret;
			};
		}
	});
}

jQuery.swap = function(elem, options, callback, args) {
	var ret, nome,
		antigo = {};

	if (!internoSwapCall) {
		migrateWarn( "jQuery.swap() não está documentado e está obsoleto" );
	}

	// Lembre-se dos valores antigos e insira os novos
	for (nome nas opções) {
		old[ nome ] = elem.style[ nome ];
		elem.style[ nome ] = opções[ nome ];
	}

	ret = callback.apply( elem, args || [] );

	// Reverte os valores antigos
	for (nome nas opções) {
		elem.style[ nome ] = antigo[ nome ];
	}

	retorno ret;
};


// Certifique-se de que $.ajax obtenha o novo parseJSON definido em core.js
jQuery.ajaxSetup({
	conversores: {
		"texto json": jQuery.parseJSON
	}
});


var oldFnData = jQuery.fn.data;

jQuery.fn.data = function( nome ) {
	var ret, evt,
		ele = this[0];

	// Manipula 1.7 que tem esse comportamento e 1.8 que não tem
	if ( elem && nome === "eventos" && argumentos.comprimento === 1 ) {
		ret = jQuery.data(elem, nome);
		evt = jQuery._data(elem, nome);
		if ( ( ( ret === indefinido || ret === evt ) && evt !== indefinido ) {
			migrateWarn("O uso de jQuery.fn.data('events') está obsoleto");
			retorno evt;
		}
	}
	return oldFnData.apply( this, arguments );
};


var rscriptType = /\/(java|ecma)script/i;

// Como jQuery.clean é usado internamente em versões mais antigas, nós apenas corrigimos se estiver faltando
if (!jQuery.clean) {
	jQuery.clean = function(elems, context, fragment, scripts) {
		// Definir contexto por lógica 1.8
		contexto = contexto || documento;
		context = !context.nodeType && context[0] || contexto;
		context = context.ownerDocument || contexto;

		migrateWarn("jQuery.clean() está obsoleto");

		var i, elem, handleScript, jsTags,
			ret = [];

		jQuery.merge(ret, jQuery.buildFragment(elems, context).childNodes);

		// Lógica complexa levantada diretamente do jQuery 1.8
		if ( fragmento ) {
			// Tratamento especial de cada elemento de script
			handleScript = function(elem) {
				// Verifica se consideramos executável
				if (!elem.type || rscriptType.test(elem.type)) {
					// Desanexar o script e armazená-lo no array de scripts (se fornecido) ou no fragmento
					// Retorna true para indicar que foi tratado
					scripts de retorno?
						scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ): elem ):
						fragment.appendChild( elem );
				}
			};

			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				// Verifica se terminamos depois de manipular um script executável
				if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
					// Anexa ao fragmento e manipula scripts incorporados
					fragment.appendChild( elem );
					if ( typeof elem.getElementsByTagName !== "undefined" ) {
						// handleScript altera o DOM, então use jQuery.merge para garantir a iteração do snapshot
						jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

						// Unir os scripts em ret após seu ancestral anterior e avançar nosso índice além deles
						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
						i += jsTags.length;
					}
				}
			}
		}

		retorno ret;
	};
}

var eventAdd = jQuery.event.add,
	eventRemove = jQuery.event.remove,
	eventTrigger = jQuery.event.trigger,
	oldToggle = jQuery.fn.toggle,
	oldLive = jQuery.fn.live,
	oldDie = jQuery.fn.die,
	oldLoad = jQuery.fn.load,
	ajaxEvents = "ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",
	rajaxEvent = new RegExp( "\\b(?:" + ajaxEvents + ")\\b" ),
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	hoverHack = function(eventos) {
		if ( typeof( events ) !== "string" || jQuery.event.special.hover ) {
			eventos de retorno;
		}
		if (rhoverHack.test(eventos)) {
			migrateWarn("O pseudo-evento 'hover' está obsoleto, use 'mouseenter mouseleave'");
		}
		return events && events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

// Adereços de eventos removidos em 1.9, coloque-os de volta se necessário; nenhuma maneira prática de avisá-los
if ( jQuery.event.props && jQuery.event.props[ 0 ] !== "attrChange" ) {
	jQuery.event.props.unshift( "attrChange", "attrName", "relatedNode", "srcElement" );
}

// jQuery.event.handle não documentado foi "obsoleto" no jQuery 1.7
if ( jQuery.event.dispatch ) {
	migrateWarnProp( jQuery.event, "handle", jQuery.event.dispatch, "jQuery.event.handle não está documentado e está obsoleto" );
}

// Suporte para pseudo-eventos 'hover' e avisos de eventos ajax
jQuery.event.add = function(elem, types, handler, data, selector){
	if ( elem !== documento && rajaxEvent.test( tipos ) ) {
		migrateWarn( "Eventos AJAX devem ser anexados ao documento: " + tipos );
	}
	eventAdd.call( this, elem, hoverHack( types || "" ), handler, data, selector );
};
jQuery.event.remove = function(elem, types, handler, selector, mappedTypes ){
	eventRemove.call( this, elem, hoverHack( types ) || "", handler, selector, mappedTypes );
};

jQuery.each( [ "carregar", "descarregar", "erro" ], function( _, nome ) {

	jQuery.fn[ nome ] = function() {
		var args = Array.prototype.slice.call( argumentos, 0 );

		// Se for um load() ajax, o primeiro argumento deve ser o URL da string;
		// tecnicamente isso também pode ser o argumento "Qualquer coisa" do evento .load()
		// o que apenas mostra por que essa assinatura idiota foi preterida!
		// compilações personalizadas do jQuery que excluem o módulo Ajax justificadamente morrem aqui.
		if ( name === "load" && typeof args[ 0 ] === "string" ) {
			return oldLoad.apply( this, args );
		}

		migrateWarn( "jQuery.fn." + nome + "() está obsoleto" );

		args.splice( 0, 0, nome );
		if (argumentos.comprimento) {
			return this.bind.apply( this, args );
		}

		// Use .triggerHandler aqui porque:
		// - eventos de carregamento e descarregamento não precisam de bolhas, apenas aplicados à janela ou imagem
		// - o evento de erro não deve aparecer na janela, embora seja pré-1.7
		// Veja http://bugs.jquery.com/ticket/11820
		this.triggerHandler.apply( this, args );
		devolva isso;
	};

});

jQuery.fn.toggle = function( fn, fn2 ) {

	// Não mexa com animações ou alternâncias css
	if ( !jQuery.isFunction( fn ) || !jQuery.isFunction( fn2 ) ) {
		return oldToggle.apply( this, arguments );
	}
	migrateWarn("jQuery.fn.toggle(handler, handler...) está obsoleto");

	// Salva referência aos argumentos para acesso no encerramento
	var argumentos = argumentos,
		guid = fn.guid || jQuery.guid++,
		e = 0,
		alternador = function(evento) {
			// Descobrir qual função executar
			var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
			jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

			// Certifique-se de que os cliques param
			event.preventDefault();

			// e executa a função
			return args[ lastToggle ].apply( this, arguments ) || falso;
		};

	// vincula todas as funções, para que qualquer uma delas possa desvincular este manipulador de cliques
	toggler.guid = guid;
	while ( i < args.length ) {
		args[i++].guid = guid;
	}

	return this.click(toggler);
};

jQuery.fn.live = function( tipos, dados, fn ) {
	migrateWarn("jQuery.fn.live() está obsoleto");
	if (antigoLive) {
		return oldLive.apply( this, arguments );
	}
	jQuery( this.context ).on(types, this.selector, data, fn );
	devolva isso;
};

jQuery.fn.die = function( tipos, fn ) {
	migrateWarn("jQuery.fn.die() está obsoleto");
	if (velhoMorrer) {
		return oldDie.apply( this, arguments );
	}
	jQuery( this.context ).off( types, this.selector || "**", fn );
	devolva isso;
};

// Transforma eventos globais em eventos acionados por documento
jQuery.event.trigger = function( event, data, elem, onlyHandlers ){
	if ( !elem && !rajaxEvent.test( evento ) ) {
		migrateWarn( "Eventos globais não estão documentados e estão obsoletos" );
	}
	return eventTrigger.call( this, event, data, elem || document, onlyHandlers );
};
jQuery.each( ajaxEvents.split("|"),
	function( _, nome ) {
		jQuery.event.special[ nome ] = {
			configuração: função() {
				var elem = este;

				// O documento não precisa de correção; deve ser !== para oldIE
				if (elem!== documento) {
					jQuery.event.add( document, name + "." + jQuery.guid, function() {
						jQuery.event.trigger( nome, Array.prototype.slice.call( argumentos, 1 ), elem, true );
					});
					jQuery._data( this, name, jQuery.guid++ );
				}
				retorna falso;
			},
			desmontagem: function() {
				if ( este !== documento ) {
					jQuery.event.remove( document, name + "." + jQuery._data( this, name ) );
				}
				retorna falso;
			}
		};
	}
);

jQuery.event.special.ready = {
	configuração: função() {
		if ( este === documento ) {
			migrateWarn( "O evento 'pronto' está obsoleto" );
		}
	}
};

var oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack,
	oldFnFind = jQuery.fn.find;

jQuery.fn.andSelf = function() {
	migrateWarn("jQuery.fn.andSelf() substituído por jQuery.fn.addBack()");
	return oldSelf.apply( this, arguments );
};

jQuery.fn.find = function(seletor) {
	var ret = oldFnFind.apply( this, arguments );
	ret.contexto = este.contexto;
	ret.selector = this.selector ? this.selector + " " + selector : selector;
	retorno ret;
};


// jQuery 1.6 não suporta Callbacks, não avise lá
if (jQuery.Callbacks) {

	var oldDeferred = jQuery.Deferred,
		tuplas = [
			// ação, adiciona ouvinte, retornos de chamada, manipuladores .then, estado final
			[ "resolver", "concluído", jQuery.Callbacks("uma vez memória"),
				jQuery.Callbacks("uma vez memória"), "resolvido" ],
			[ "rejeitar", "falhar", jQuery.Callbacks("uma vez memória"),
				jQuery.Callbacks("uma vez memória"), "rejeitado" ],
			[ "notificar", "progresso", jQuery.Callbacks("memória"),
				jQuery.Callbacks("memória") ]
		];

	jQuery.Deferred = function(func) {
		var adiado = oldDeferred(),
			promessa = deferred.promise();

		deferred.pipe = promessa.pipe = function( /* fnDone, fnFail, fnProgress */ ) {
			var fns = argumentos;

			migrateWarn( "deferred.pipe() está obsoleto" );

			return jQuery.Deferred(function( newDefer ) {
				jQuery.each( tuplas, function( i, tupla ) {
					var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
					// deferred.done(function() { bind to newDefer ou newDefer.resolve })
					// deferred.fail(function() { bind to newDefer ou newDefer.reject })
					// deferred.progress(function() { bind to newDefer ou newDefer.notify })
					adiado[ tupla[1] ](function() {
						var return = fn && fn.apply( this, arguments );
						if ( return && jQuery.isFunction( return.promise ) ) {
							devolvido.promessa()
								.done( newDefer.resolve )
								.fail( newDefer.reject )
								.progress( newDefer.notify );
						} senão {
							newDefer[ tupla[ 0 ] + "Com" ](
								esta === promessa? newDefer.promise() : this,
								fn? [retornado]: argumentos
							);
						}
					});
				});
				fn = nulo;
			}).promessa();

		};

		deferred.isResolved = function() {
			migrateWarn( "deferred.isResolved está obsoleto" );
			return deferred.state() === "resolvido";
		};

		deferred.isRejected = function() {
			migrateWarn( "deferred.isRejected está obsoleto" );
			return deferred.state() === "rejeitado";
		};

		if (fun) {
			func.call( adiado, adiado );
		}

		retorno adiado;
	};

}

})( jQuery, janela );