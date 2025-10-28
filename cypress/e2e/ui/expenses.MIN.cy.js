/// <reference types="cypress" />
import GaragePage from "../../pages/GaragePage";

const garage = new GaragePage();

describe("Cars + Expenses", () => {
  const CAR = { brand: "Audi", model: "TT", mileage: 12500 };

  it("UI create car → capture expense payload → API expense → UI verify", () => {
    const email = `qa_${Date.now()}_${Math.floor(
      Math.random() * 1e6
    )}@example.com`;
    const password = "Qauto123!";
    const u = Cypress.env("basicAuthUser") || "guest";
    const p = Cypress.env("basicAuthPass") || "welcome2qauto";
    const base = (
      Cypress.config("baseUrl") || "https://qauto.forstudy.space"
    ).replace(/\/$/, "");
    const withAuth = new URL(base);
    withAuth.username = u;
    withAuth.password = p;

    cy.visit(withAuth.toString());
    cy.contains(/sign up|register/i).click({ force: true });

    cy.get("body")
      .then(($b) => {
        if ($b.find('[role="dialog"], .modal.show').length)
          return cy.get('[role="dialog"], .modal.show');
        return cy.wrap($b);
      })
      .as("dlg");

    cy.get("@dlg")
      .contains(/name/i)
      .parent()
      .find("input")
      .clear()
      .type("John");
    cy.get("@dlg")
      .contains(/last\s*name|surname/i)
      .parent()
      .find("input")
      .clear()
      .type("Doe");
    cy.get("@dlg")
      .contains(/^email$/i)
      .parent()
      .find("input")
      .clear()
      .type(email);
    cy.get("@dlg")
      .contains(/^password$/i)
      .parent()
      .find("input")
      .clear()
      .type(password);
    cy.get("@dlg")
      .contains(/(re-?enter|confirm)\s*password/i)
      .parent()
      .find("input")
      .clear()
      .type(password);
    cy.get("@dlg")
      .contains(/register|sign up/i)
      .click({ force: true });
    cy.location("pathname", { timeout: 20000 }).should("include", "/panel");

    garage.open();
    garage.addCar(CAR);

    cy.get("@createdCarId").then((carId) => {
      expect(carId, "created car id").to.be.a("number");

      cy.request("GET", "/api/cars").then((r) => {
        expect(r.status).to.eq(200);
        const list = r.body?.data ?? r.body ?? [];
        const found = list.find((c) => {
          const idFromList = c?.id ?? c?.carId ?? c?.car?.id;
          const brand = (c?.brand || c?.make || "").toString().toLowerCase();
          const model = (c?.model || "").toString().toLowerCase();
          return (
            Number(idFromList) === Number(carId) &&
            brand.includes(CAR.brand.toLowerCase()) &&
            model.includes(CAR.model.toLowerCase())
          );
        });
        expect(found, "car present in GET /api/cars").to.exist;
      });

      cy.intercept("POST", "**/api/expenses").as("uiExpense");

      cy.contains(".car,.card,article,tr", /Audi\s+TT/i)
        .should("be.visible")
        .within(() => {
          cy.contains("button,a", /add fuel expense/i).click({ force: true });
        });

      const dd = (n) => String(n).padStart(2, "0");
      const d = new Date();
      const dateDDMMYYYY = `${dd(d.getDate())}.${dd(
        d.getMonth() + 1
      )}.${d.getFullYear()}`;

      cy.get("ngb-modal-window.d-block.modal.show,[role='dialog']")
        .as("dlg2")
        .should("be.visible");
      cy.get("@dlg2")
        .contains(/date|report date/i)
        .parent()
        .find("input")
        .clear()
        .type(dateDDMMYYYY, { force: true });
      cy.get("@dlg2")
        .contains(/mileage|odometer/i)
        .parent()
        .find("input")
        .clear()
        .type("12600");
      cy.get("@dlg2")
        .contains(/liters|volume|number of liters/i)
        .parent()
        .find("input")
        .clear()
        .type("40");
      cy.get("@dlg2")
        .contains(/total cost|price|amount/i)
        .parent()
        .find("input")
        .clear()
        .type("70");
      cy.get("@dlg2").contains(/^add$/i).click({ force: true });

      cy.wait("@uiExpense").then(({ request, response }) => {
        expect([200, 201]).to.include(response?.statusCode);

        const originalBody = request.body || {};
        const originalHeaders = request.headers || {};
        const isForm = String(
          originalHeaders["content-type"] ||
            originalHeaders["Content-Type"] ||
            ""
        ).includes("application/x-www-form-urlencoded");

        const baseCarId = Number(
          originalBody.carId || originalBody.car_id || carId
        );
        const dateKey =
          Object.keys(originalBody).find((k) => /date/i.test(k)) || "date";

        return cy
          .request("GET", `/api/expenses?carId=${baseCarId}`)
          .then((rr) => {
            const expList = rr.body?.data ?? rr.body ?? [];
            const last = expList.sort(
              (a, b) =>
                Number((b.mileage ?? b.odometer) || 0) -
                Number((a.mileage ?? a.odometer) || 0)
            )[0];
            const nextMileage =
              (last
                ? Number(last.mileage ?? last.odometer)
                : Number(CAR.mileage)) + 1;

            const apiBody = { ...originalBody, carId: baseCarId };
            if ("mileage" in apiBody) apiBody.mileage = String(nextMileage);
            else if ("odometer" in apiBody)
              apiBody.odometer = String(nextMileage);
            if (!apiBody[dateKey]) apiBody[dateKey] = dateDDMMYYYY;

            const reqOptions = {
              method: "POST",
              url: "/api/expenses",
              body: apiBody,
              failOnStatusCode: false,
            };
            if (isForm) reqOptions.form = true;
            else reqOptions.headers = { "Content-Type": "application/json" };

            cy.wrap(nextMileage).as("apiMileage");

            return cy.request(reqOptions).then((apiResp) => {
              if (![200, 201].includes(apiResp.status))
                cy.log("API expense FAILED:", JSON.stringify(apiResp.body));
              expect([200, 201]).to.include(apiResp.status);

              const bb = apiResp.body || {};
              const exp = bb.data ?? bb.expense ?? bb;
              expect(exp).to.exist;
              expect(Number(exp.carId || exp.car_id)).to.eq(Number(baseCarId));
              const expMileage = Number(exp.mileage ?? exp.odometer);
              expect(expMileage).to.eq(nextMileage);
            });
          });
      });

      cy.contains(/fuel expenses/i).click({ force: true });
      cy.location("pathname").should("include", "/panel/expenses");
      cy.get("@apiMileage").then((m) => {
        cy.contains(
          ".table,.list,.card,article,tr",
          new RegExp(`\\b${m}\\b`)
        ).should("exist");
      });
    });
  });
});
