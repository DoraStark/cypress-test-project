/// <reference types="cypress" />

console.log("commands.js LOADED v3");
Cypress.Commands.add("visitWithAuth", (path = "/") => {
  const u = Cypress.env("basicAuthUser");
  const p = Cypress.env("basicAuthPass");
  const baseUrl = Cypress.config("baseUrl") || "https://qauto.forstudy.space";
  const url = new URL(baseUrl);
  url.username = u || "";
  url.password = p || "";
  cy.visit(`${url.toString().replace(/\/$/, "")}${path}`);
});
Cypress.Commands.add("login", (email, password) => {
  cy.visitWithAuth("/panel/login");

  cy.get('input[type="email"], input[name="email"]', { timeout: 15000 })
    .should("be.visible")
    .first()
    .clear()
    .type(email);

  cy.get('input[type="password"], input[name="password"]')
    .first()
    .clear()
    .type(password, { sensitive: true });

  cy.contains("button", /log in|sign in/i, { timeout: 15000 })
    .should("be.visible")
    .click({ force: true });
  cy.contains("a,button", /garage|profile|fuel expenses|logout/i, {
    timeout: 20000,
  }).should("be.visible");
});

Cypress.Commands.overwrite(
  "type",
  (originalFn, element, text, options = {}) => {
    if (options.sensitive) {
      options.log = false;
      Cypress.log({
        $el: element,
        name: "type",
        message: "*".repeat(String(text).length),
      });
    }
    return originalFn(element, text, options);
  }
);

const getFormScope = () =>
  cy.get("body").then(($b) => {
    if ($b.find(".modal.show,[role='dialog']").length) {
      return cy.get(".modal.show,[role='dialog']");
    }
    return cy.wrap($b);
  });
Cypress.Commands.add("registerNewUniqueUser", (opts = {}) => {
  const name = opts.name || "John";
  const lastName = opts.lastName || "Doe";
  const password = opts.password || "Qauto123!";
  const email = `${opts.prefix || "qa"}_${Date.now()}_${Math.floor(
    Math.random() * 1e6
  )}@example.com`;

  cy.wrap({ email, password, name, lastName }).as("uniqueUser");

  cy.visitWithAuth("/");
  cy.contains("a,button", /sign up|register/i, { timeout: 15000 })
    .scrollIntoView()
    .click({ force: true });
  getFormScope()
    .find("form, input, button", { timeout: 15000 })
    .should("be.visible");

  getFormScope().then(($s) => {
    const onLogin =
      $s.find('label:contains("Email"),label:contains("Password")').length >
        0 &&
      $s.find('button:contains("Log in"),button:contains("Sign in")').length >
        0;
    if (onLogin)
      cy.contains("button,a", /sign up|register/i).click({ force: true });
  });
  cy.intercept("POST", "**/api/auth/signup").as("signup");
  getFormScope().within(() => {
    cy.contains("label", /^name$/i)
      .parent()
      .find("input")
      .clear()
      .type(name);
    cy.contains("label", /(last\s*name|surname)/i)
      .parent()
      .find("input")
      .clear()
      .type(lastName);
    cy.contains("label", /^email$/i)
      .parent()
      .find("input")
      .clear()
      .type(email);
    cy.contains("label", /^password$/i)
      .parent()
      .find("input")
      .clear()
      .type(password, { sensitive: true });
    cy.contains("label", /(re-?enter|confirm)\s*password/i)
      .parent()
      .find("input")
      .clear()
      .type(password, { sensitive: true });
    cy.contains("button,input[type='submit']", /register|sign up/i).click({
      force: true,
    });
  });

  cy.wait("@signup", { timeout: 20000 })
    .its("response.statusCode")
    .should((code) => expect([200, 201]).to.include(code));

  cy.location("pathname", { timeout: 20000 }).then((p) => {
    if (!p.includes("/panel/garage")) {
      cy.get("@uniqueUser").then(({ email, password }) => {
        cy.login(email, password);
      });
    }
  });
  cy.location("pathname", { timeout: 20000 }).should(
    "include",
    "/panel/garage"
  );
  cy.contains("button,a", /^add car$/i, { timeout: 20000 }).should(
    "be.visible"
  );
});
Cypress.Commands.add("addCarUI", ({ brand, model, mileage }) => {
  cy.contains("button,a", /^add car$/i, { timeout: 15000 })
    .should("be.visible")
    .click();
  cy.get(".modal.show,[role='dialog']", { timeout: 15000 }).as("dlg");
  cy.intercept("GET", "**/api/cars/models*").as("models");
  cy.get("@dlg")
    .contains("label", /brand/i)
    .parent()
    .find("select")
    .should("be.enabled")
    .select(brand, { force: true });
  cy.wait("@models");
  cy.get("@dlg")
    .contains("label", /model/i)
    .parent()
    .find("select")
    .should("be.enabled")
    .select(model, { force: true });
  cy.get("@dlg")
    .contains("label", /mileage|odometer/i)
    .parent()
    .find("input[type='number'], input")
    .clear()
    .type(String(mileage));
  cy.get("@dlg").contains("button,input[type='submit']", /^add$/i).click();
  cy.contains(".toast,.alert,[role='status']", /added|success/i, {
    timeout: 15000,
  }).should("be.visible");
  cy.contains(".car, .card, tr", brand, { timeout: 15000 }).should("exist");
});

Cypress.Commands.add("apiGetCars", () => {
  return cy.request({
    method: "GET",
    url: "/api/cars",
  });
});
Cypress.Commands.add(
  "createExpenseApi",
  ({ carId, mileage, liters, totalCost, reportDate }) => {
    const dd = (n) => String(n).padStart(2, "0");
    const d = new Date();
    const isoDate =
      reportDate ||
      `${d.getFullYear()}-${dd(d.getMonth() + 1)}-${dd(d.getDate())}`;
    const ddmmyyyy = `${dd(d.getDate())}.${dd(
      d.getMonth() + 1
    )}.${d.getFullYear()}`;
    const cid = Number(carId);
    const vol = Number(liters);
    const cost = Number(totalCost);

    const getCarMileage = () =>
      cy
        .request({ method: "GET", url: "/api/cars", failOnStatusCode: false })
        .then((r) => {
          const list = r.body?.data ?? r.body ?? [];
          const car =
            list.find((c) => Number(c?.id ?? c?.carId ?? c?.car?.id) === cid) ||
            {};
          return Number(car.mileage ?? car.odometer ?? car.initialMileage ?? 0);
        });

    const getLastExpenseMileage = () =>
      cy
        .request({
          method: "GET",
          url: `/api/expenses?carId=${cid}`,
          failOnStatusCode: false,
        })
        .then((r) => {
          const list = r.body?.data ?? r.body ?? [];
          return list.reduce((m, x) => {
            const v = Number(x.mileage ?? x.odometer ?? 0);
            return v > m ? v : m;
          }, 0);
        });

    const postJson = (finalMileage) =>
      cy.request({
        method: "POST",
        url: "/api/expenses",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: {
          carId: cid,
          mileage: finalMileage,
          liters: vol,
          totalCost: cost,
          reportDate: isoDate,
        },
        failOnStatusCode: false,
      });

    const postForm = (finalMileage) =>
      cy.request({
        method: "POST",
        url: "/api/expenses",
        form: true,
        body: {
          carId: String(cid),
          mileage: String(finalMileage),
          liters: String(vol),
          totalCost: String(cost),
          reportDate: ddmmyyyy,
        },
        failOnStatusCode: false,
      });

    return cy.wrap(null).then(() =>
      Promise.all([getCarMileage(), getLastExpenseMileage()]).then(
        ([carMileage, lastExp]) => {
          const candidate = Number(mileage ?? 0);
          const finalMileage = Math.max(candidate, carMileage + 1, lastExp + 1);
          return postJson(finalMileage)
            .then((r1) => {
              if (![200, 201].includes(r1.status)) {
                return postForm(finalMileage).then((r2) => ({
                  resp: r2,
                  finalMileage,
                }));
              }
              return { resp: r1, finalMileage };
            })
            .then(({ resp, finalMileage }) => {
              expect([200, 201]).to.include(resp.status);
              const b = resp.body || {};
              const exp = b.data ?? b.expense ?? b;
              expect(exp).to.exist;
              expect(Number(exp.carId || exp.car_id)).to.eq(cid);
              expect(Number(exp.liters || exp.volume)).to.eq(vol);
              expect(Number(exp.totalCost || exp.price)).to.eq(cost);
              expect(Number(exp.mileage ?? exp.odometer)).to.eq(finalMileage);
              return { expense: exp, mileage: finalMileage };
            });
        }
      )
    );
  }
);
