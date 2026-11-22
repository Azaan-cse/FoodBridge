-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FoodListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foodName" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "servings" INTEGER NOT NULL,
    "preparedAt" DATETIME NOT NULL,
    "pickupDeadline" DATETIME NOT NULL,
    "storageInfo" TEXT NOT NULL,
    "allergens" TEXT,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donorId" TEXT NOT NULL,
    CONSTRAINT "FoodListing_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FoodClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CLAIMED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    CONSTRAINT "FoodClaim_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "FoodListing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FoodClaim_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
