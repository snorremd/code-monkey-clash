// TODO: Remove this interface override when new https://github.com/kitajs/html/ releases
declare namespace JSX {
	interface HtmlButtonTag extends HtmlTag {
		action?: undefined | string;
		autofocus?: undefined | string;
		disabled?: undefined | boolean;
		enctype?: undefined | string;
		form?: undefined | string;
		method?: undefined | string;
		name?: undefined | string;
		novalidate?: undefined | string | boolean;
		target?: undefined | string;
		type?: undefined | string;
		value?: undefined | string;
		formaction?: undefined | string;
		formenctype?: undefined | string;
		formmethod?: undefined | string;
		formnovalidate?: undefined | string | boolean;
		formtarget?: undefined | string;
		popovertarget?: undefined | string;
		popovertargetaction?: undefined | string;
	}
}
