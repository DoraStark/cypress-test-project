/// <reference types="cypress" />

describe("Cars + Expenses (UI+API, единый поток без @алиасов)", () => {
  const CAR = { brand: "Audi", model: "TT", mileage: 12500 };
  const EXP = { mileage: 12600, liters: 40, totalCost: 70 };

  it("UI: создать авто → перехватить id → API: сверка списка → API: создать расход → UI: увидеть расход", () => {
    cy.registerNewUniqueUser({
      name: "John",
      lastName: "Doe",
      password: "Qauto123!",
    });

    cy.contains("a,button", /^garage$/i).click({ force: true });
    cy.location("pathname").should("include", "/panel/garage");

    cy.intercept("POST", "**/api/cars").as("createCar");

    cy.addCarUI(CAR);

    cy.wait("@createCar").then(({ response }) => {
      expect([200, 201]).to.include(response?.statusCode);

      const body = response?.body || {};
      const carId =
        body?.id ??
        body?.data?.id ??
        body?.data?.carId ??
        body?.data?.car?.id ??
        body?.carId ??
        body?.car?.id;

      expect(carId, "created car id").to.be.a("number");

      Cypress.env("createdCarId", carId);
      cy.writeFile("cypress/fixtures/lastCar.json", { carId });

      return cy.request("GET", "/api/cars").then((resp) => {
        expect(resp.status).to.eq(200);
        const list = resp.body?.data ?? resp.body ?? [];
        expect(list).to.be.an("array").and.not.empty;

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
        expect(found, "created car present in GET /api/cars").to.exist;

        const today = new Date().toISOString().slice(0, 10);
        return cy.createExpenseApi({
          carId,
          mileage: EXP.mileage,
          liters: EXP.liters,
          totalCost: EXP.totalCost,
          reportDate: today,
        });
      });
    });

    cy.contains("a,button", /^fuel expenses$/i).click({ force: true });
    cy.location("pathname").should("include", "/panel/expenses");
    cy.contains(
      ".table,.list,.card,article,tr",
      new RegExp(String(EXP.mileage))
    ).should("exist");
  });
});
