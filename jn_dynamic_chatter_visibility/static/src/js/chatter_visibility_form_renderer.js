/** @odoo-module */
import {FormRenderer} from "@web/views/form/form_renderer";
import { FormController } from "@web/views/form/form_controller";
import { FormCompiler } from "@web/views/form/form_compiler";
import {registry} from '@web/core/registry';
import {formView} from '@web/views/form/form_view';
import {append, createElement, getTag} from "@web/core/utils/xml";
import {isTextNode} from "@web/views/view_compiler";

const {onMounted} = owl;


export class ChatterVisibilityFormRenderer extends FormRenderer {

    // Extracting constant selectors for better maintainability
    static CHATTER_CONTAINER_SELECTOR = 'div.o-mail-ChatterContainer';
    static HIDE_CHATTER_BUTTON = 'button.hide_chatter';
    static SHOW_CHATTER_BUTTON = 'button.show_chatter';

    setup() {
        super.setup();
        this.initializeChatterHandlers();
        onMounted(() => {
            const formRendererElement = $(document).find('div.o_form_statusbar') || document.querySelector('div.o_form_statusbar');
            if (formRendererElement.length > 0) {
                $('div.o_form_sheet_bg > div.o_chatter_visibility').addClass('d-none');
            }
        });
    }

    // Extracted function to toggle chatter visibility
    toggleChatterVisibility(hide = true) {
        const container = $(ChatterVisibilityFormRenderer.CHATTER_CONTAINER_SELECTOR);
        const hideButton = $(ChatterVisibilityFormRenderer.HIDE_CHATTER_BUTTON);
        const showButton = $(ChatterVisibilityFormRenderer.SHOW_CHATTER_BUTTON);

        if (hide) {
            container.addClass('d-none');
            hideButton.addClass('d-none');
            showButton.removeClass('d-none');
        } else {
            container.removeClass('d-none');
            showButton.addClass('d-none');
            hideButton.removeClass('d-none');
        }
    }

    // Extracted function to set up event handlers
    initializeChatterHandlers() {
        onMounted(() => {
            $(document).ready(() => {
                $(ChatterVisibilityFormRenderer.HIDE_CHATTER_BUTTON).on('click', () => this.toggleChatterVisibility(true));
                $(ChatterVisibilityFormRenderer.SHOW_CHATTER_BUTTON).on('click', () => this.toggleChatterVisibility(false));
            });
        });
    }
}


export class ChatterVisibilityFormCompiler extends FormCompiler {

    setup() {
        super.setup();
    }

    compileHeader(el, params) {
        const statusBar = createElement("div");
        statusBar.className =
            "o_form_statusbar position-relative d-flex justify-content-between mb-0 mb-md-2 pb-2 pb-md-0";
        const buttons = [];
        const others = [];
        for (const child of el.childNodes) {
            const compiled = this.compileNode(child, params);
            if (!compiled || isTextNode(compiled)) {
                continue;
            }
            if (getTag(child, true) === "field") {
                compiled.setAttribute("showTooltip", true);
                others.push(compiled);
            } else {
                if (compiled.tagName === "ViewButton") {
                    compiled.setAttribute("defaultRank", "'btn-secondary'");
                }
                buttons.push(compiled);
            }
        }
        let slotId = 0;
        const statusBarButtons = createElement("StatusBarButtons");
        for (const button of buttons) {
            const slot = createElement("t", {
                "t-set-slot": `button_${slotId++}`,
                isVisible: button.getAttribute("t-if") || true,
            });
            append(slot, button);
            append(statusBarButtons, slot);
        }

        append(statusBar, statusBarButtons);
        append(statusBar, others);

        // Compile Button Show/Hide Chatter
        const compiledChatterButton = this.compileChatterVisibilityButton()
        if (others) {
            const divStatusBar = createElement("div");
            divStatusBar.className = "d-flex gap-1"
            append(divStatusBar, others)
            append(divStatusBar, compiledChatterButton)
            append(statusBar, divStatusBar);
        } else {
            append(statusBar, compiledChatterButton)
        }
        // End compile

        return statusBar;
    }

    compileChatterVisibilityButton() {
        // Constants for class names
        const BUTTON_CLASS = "btn btn-secondary";
        const SHOW_CHATTER_TITLE = "Show Chatter";
        const HIDE_CHATTER_TITLE = "Hide Chatter";

        /**
         * Reusable function to create a button
         * @param {string} className - Classes for the button
         * @param {string} title - Title attribute for the button
         * @param {string} ariaLabel - ARIA label
         * @param {string} innerHTML - HTML content inside the button
         * @returns {Element} - Created button element
         */
        function createButton(className, title, ariaLabel, innerHTML) {
            const button = createElement("button");
            button.className = className;
            button.title = title;
            button.ariaLabel = ariaLabel;
            append(button, innerHTML);
            return button;
        }

        // Container for the show/hide chatter buttons
        const chatterContainer = createElement("div");
        chatterContainer.className = "o_chatter_visibility";

        const showChatterButton = createButton(
            BUTTON_CLASS + " show_chatter d-none",
            SHOW_CHATTER_TITLE,
            SHOW_CHATTER_TITLE,
            "Show Chatter"
        );
        append(chatterContainer, showChatterButton);

        const hideChatterButton = createButton(
            BUTTON_CLASS + " hide_chatter",
            HIDE_CHATTER_TITLE,
            HIDE_CHATTER_TITLE,
            "Hide Chatter"
        );
        append(chatterContainer, hideChatterButton);
        return chatterContainer;
    }

    compileSheet(el, params) {
        const sheetBG = createElement("div");
        sheetBG.className = "o_form_sheet_bg";
        const formStatusbar = document.querySelector('div.o_form_statusbar');

        const compiledChatterButton = this.compileChatterVisibilityButton();
        $(compiledChatterButton).addClass('d-flex justify-content-end mb-md-2')
        append(sheetBG, compiledChatterButton);

        const sheetFG = createElement("div");
        sheetFG.className = "o_form_sheet position-relative";

        append(sheetBG, sheetFG);
        for (const child of el.childNodes) {
            const compiled = this.compileNode(child, params);
            if (!compiled) {
                continue;
            }
            if (compiled.nodeName === "ButtonBox") {
                // in form views with a sheet, the button box is moved to the
                // control panel, and in dialogs, there's no button box
                continue;
            }
            if (getTag(child, true) === "field") {
                compiled.setAttribute("showTooltip", true);
            }
            append(sheetFG, compiled);
        }
        return sheetBG;
    }

}

export const ChatterVisibilityFormView = {
    ...formView,
    Renderer: ChatterVisibilityFormRenderer,
    Compiler: ChatterVisibilityFormCompiler,
    Controller: FormController,
};

registry.category("views").add("dynamic_chatter_visibility", ChatterVisibilityFormView);
