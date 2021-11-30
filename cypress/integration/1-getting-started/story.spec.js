Cypress.config("defaultCommandTimeout", 10000);
import { v4 as uuidv4 } from "uuid";

describe("My First Test", () => {
  before(function () {
    cy.clearCookies();
    createTitles();
    createTitles();
    cy.visit(Cypress.env("LOGIN_URL"));

    cy.get('input[name="login"]').type(Cypress.env("USER_EMAIL"));
    cy.get('input[name="password"]').type(Cypress.env("CYPRESS_PSW"));
    cy.get('input[name="login_submit"]').click();
    cy.visit(Cypress.env("SANDBOX_URL"));
  });

  beforeEach(() => {
    // Stays loggedin
    Cypress.Cookies.preserveOnce("kp", "remember_token");
  });

  // Story titles
  const storyTitles = [];
  const createTitles = () => {
    storyTitles.push(uuidv4());
  };

  // Space name
  const space = uuidv4();

  // Image used for the file uploads
  const imagepath = "images/image.jpeg";
  const filepath = "files/fsociety.txt";

  const clickButton = (index, multiple = false) => {
    cy.get(`aside [draggable=true]:nth-child(${index}) button`).click();
    if (multiple) {
      cy.get(`aside [draggable=true]:nth-child(${index}) button`).click();
    }
  };

  const createParagraphe = () => {
    clickButton(1, true);
    cy.focused().type("This is a paragraph");
    cy.get("[data-editor-readonly=false]").should(
      "contain",
      "This is a paragraph"
    );
  };

  const createImage = () => {
    clickButton(2);
    cy.get('input[type="file"]').attachFile(imagepath);
  };

  const createFile = () => {
    clickButton(3);
    cy.get('input[type="file"]').attachFile(filepath);
  };

  const createLink = () => {
    clickButton(4);
    cy.get('input[placeholder="https://..."]').type("https://www.lipsum.com/");
    cy.contains("Soumettre").click();
    cy.get("[data-editor-readonly=false]").should("contain", "Lorem Ipsum");
  };

  const createUser = () => {
    clickButton(6);
    cy.get('input[placeholder="Rechercher un utilisateur"]')
      .type("ben")
      .wait(500);
    cy.get('[role="listbox"]').click();
  };

  const createGallery = () => {
    clickButton(5);
    cy.get('input[placeholder="Entrer le titre de la galerie..."]').type(
      "Galerie"
    );
    cy.get('input[type="file"]').attachFile([imagepath, imagepath]);
  };

  const createTable = () => {
    clickButton(7);
    cy.focused().type("First row");
    // Needed to hide the table styling pannel
    cy.get("#content").click(0, 0);
  };

  const createSeparator = () => {
    clickButton(11);
  };

  const createCode = () => {
    clickButton(16);
    cy.focused().type("Hello world!");
  };

  const createEmbed = () => {
    clickButton(17);
    cy.get(
      'textarea[placeholder="Collez votre code HTML ici. Il mettra à jour le bloc d\'intégration."]'
    ).type("<h1>Hello world!</h1>");
  };

  const createStoryBlock = (uuid) => {
    cy.intercept("graphql/query/StorySelectQuery").as("storySelect");
    clickButton(8);
    cy.contains("Sélectionner un contenu").click();
    cy.focused().type(uuid);
    cy.wait("@storySelect").then(() => {
      cy.contains(uuid).click();
    });
  };

  const saveStory = (space) => {
    cy.intercept("graphql/query/SpaceSelectQuery").as("spaceSelect");
    cy.get('[data-intercom-target="space-select"]').click();
    cy.focused().type(space);
    cy.wait("@spaceSelect").then(() => {
      cy.get('[data-select-menu-outer="true"]').contains(space).click();
    });
    cy.contains("Enregistrer").click();
    cy.contains("Publier").click();
    cy.get('input[placeholder="Rechercher ou créer des tags"]').type("sometag");
    cy.get('li[label="Créer le tag sometag"]').click();
    cy.contains("Choisissez une catégorie").click();
    cy.get('li[label="Autres tags"]').click();
    cy.contains("Créer le tag").click();
    cy.get('[data-dialog-part="actions"]').contains("Publier").click();
  };

  const createSpace = (name) => {
    cy.get('[data-intercom-target="space-create-button"]').click();
    cy.focused().type(name);
    cy.get('[data-dialog-part="actions"]').contains("Créer").click();
  };

  const useSearch = (item) => {
    cy.intercept("graphql/query/utils_QuickSearchQuery").as("quickSearch");
    cy.get('[data-intercom-target="quick-search-bar"] input')
      .click()
      .clear()
      .type(item);
    cy.wait("@quickSearch").then(() => {
      cy.get('[data-intercom-target="search-result-pannel"]').contains(item);
    });
  };

  const deleteStory = (storyTitle) => {
    cy.intercept("graphql/mutation/storyDeleteMutation").as("storyDelete");
    useSearch(space);
    cy.get('[data-intercom-target="search-result-pannel"]')
      .contains(space)
      .click();
    cy.get('[data-intercom-target="content-feed-body"]')
      .contains(storyTitle)
      .click();
    cy.get('[data-intercom-target="story-more-button"]').click();
    cy.get('[data-testid="popover-wrapper"]').contains("Supprimer").click();
    cy.get('[data-dialog-part="actions"]').contains("Supprimer").click();
    cy.wait("@storyDelete").then(() => {
      return;
    });
  };

  const fillGlobalTag = () => {
    cy.intercept("graphql/query/SelectWidgetQuery").as("selectWidget");
    cy.get(".Select-placeholder").click();
    cy.wait("@selectWidget").then(() => {
      cy.get(".Select-menu-outer").contains("a").click();
      cy.get('[data-ref="StoryEditorBody"]').click();
    });
  };

  /**
   * Test suite
   */

  it("Create a new space", () => {
    cy.intercept("graphql/mutation/spaceAddMutation").as("spaceAdd");
    createSpace(space);
    cy.wait("@spaceAdd").then(() => {
      return;
    });
  });

  it("Create a story", () => {
    cy.get("[data-intercom-target=create-button]").click();
    cy.contains("Story").click({ force: true });

    cy.get("[placeholder=Titre]").type(storyTitles[0]);
    fillGlobalTag();
    createParagraphe();
    saveStory(space);
  });

  it("Create a story and test every block type", () => {
    cy.get("[data-intercom-target=create-button]").click();
    cy.contains("Story").click({ force: true });
    cy.get("[placeholder=Titre]").type(storyTitles[1]);
    fillGlobalTag();
    createLink();
    createStoryBlock(storyTitles[0]);
    createParagraphe();
    createSeparator();
    createUser();
    createImage();
    createFile();
    createGallery();
    createCode();
    createEmbed();
    createTable();
    saveStory(space);
  });

  it("Check the story can be found using the search", () => {
    useSearch(storyTitles[1]);
  });

  it("Check if it can delete previously created story", () => {
    deleteStory(storyTitles[0]);
  });

  it("Delete previously created space", () => {
    useSearch(space);
    cy.get('[data-intercom-target="search-result-pannel"]')
      .contains(space)
      .click();
    cy.get('[data-intercom-target="space-settings"]').click();
    cy.contains("Confirmer la suppression").click();
    cy.get('[data-dialog-part="actions"]')
      .contains("Supprimer l'espace")
      .click();
  });
});
