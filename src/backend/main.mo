import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type FoodBridgeUser = {
    id : Principal;
    role : {
      #donor;
      #ngo;
    };
    name : Text;
    organizationName : Text;
    address : Text;
    lat : Float;
    lng : Float;
    contact : Text; // phone or email
  };

  module FoodBridgeUser {
    public func compare(user1 : FoodBridgeUser, user2 : FoodBridgeUser) : Order.Order {
      Principal.compare(user1.id, user2.id);
    };
  };

  type DonationStatus = {
    #pending;
    #accepted;
    #pickedUp;
  };

  type Donation = {
    id : Nat;
    donorId : Principal;
    foodType : Text;
    quantity : Text;
    expiryDescription : Text;
    address : Text;
    lat : Float;
    lng : Float;
    notes : Text;
    status : DonationStatus;
    acceptedByNgoId : ?Principal;
    acceptedByNgoName : ?Text;
    createdAt : Time.Time;
  };

  module Donation {
    public func compare(donation1 : Donation, donation2 : Donation) : Order.Order {
      Nat.compare(donation1.id, donation2.id);
    };
  };

  let users = Map.empty<Principal, FoodBridgeUser>();
  let donations = Map.empty<Nat, Donation>();
  var donationIdCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Required user profile functions for frontend integration
  public query ({ caller }) func getCallerUserProfile() : async ?FoodBridgeUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : FoodBridgeUser) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?FoodBridgeUser {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless admin");
    };
    users.get(user);
  };

  // FoodBridge-specific profile management
  public shared ({ caller }) func saveProfile(
    role : { #donor; #ngo },
    name : Text,
    organizationName : Text,
    address : Text,
    lat : Float,
    lng : Float,
    contact : Text,
  ) : async FoodBridgeUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile : FoodBridgeUser = {
      id = caller;
      role;
      name;
      organizationName;
      address;
      lat;
      lng;
      contact;
    };
    users.add(caller, profile);
    profile;
  };

  public query ({ caller }) func getProfile() : async ?FoodBridgeUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getProfileById(id : Principal) : async ?FoodBridgeUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(id);
  };

  public shared ({ caller }) func submitDonation(
    foodType : Text,
    quantity : Text,
    expiryDescription : Text,
    address : Text,
    lat : Float,
    lng : Float,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit donations");
    };

    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("Profile does not exist. Please create a profile first");
      };
      case (?user) {
        if (user.role != #donor) {
          Runtime.trap("Only donors can submit donations");
        };

        let newId = donationIdCounter;
        donationIdCounter += 1;

        let donation : Donation = {
          id = newId;
          donorId = caller;
          foodType;
          quantity;
          expiryDescription;
          address;
          lat;
          lng;
          notes;
          status = #pending;
          acceptedByNgoId = null;
          acceptedByNgoName = null;
          createdAt = Time.now();
        };

        donations.add(newId, donation);
        newId;
      };
    };
  };

  public query ({ caller }) func getMyDonations() : async [Donation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view donations");
    };

    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("Profile does not exist. Please create a profile first");
      };
      case (?user) {
        if (user.role != #donor) {
          Runtime.trap("Only donors can view their donations");
        };
        donations.values().toArray().filter(
          func(d) { d.donorId == caller }
        ).sort();
      };
    };
  };

  public query ({ caller }) func getAvailableDonations() : async [Donation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available donations");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist. Please create a profile first") };
      case (?user) {
        if (user.role != #ngo) {
          Runtime.trap("Only NGOs can view available donations");
        };
        donations.values().toArray().filter(
          func(d) { d.status == #pending }
        ).sort();
      };
    };
  };

  public query ({ caller }) func getAllDonations() : async [Donation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all donations");
    };
    donations.values().toArray().sort();
  };

  public query ({ caller }) func getDonationById(id : Nat) : async ?Donation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view donations");
    };
    donations.get(id);
  };

  public shared ({ caller }) func acceptDonation(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept donations");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("Caller does not have a profile") };
      case (?ngo) {
        if (ngo.role != #ngo) {
          Runtime.trap("Only NGOs can accept donations");
        };

        switch (donations.get(id)) {
          case (null) { Runtime.trap("Donation does not exist") };
          case (?donation) {
            if (donation.status != #pending) {
              Runtime.trap("Donation is not pending");
            };

            let updatedDonation : Donation = {
              donation with
              status = #accepted;
              acceptedByNgoId = ?caller;
              acceptedByNgoName = ?ngo.organizationName;
            };

            donations.add(id, updatedDonation);
          };
        };
      };
    };
  };

  public shared ({ caller }) func markPickedUp(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark donations as picked up");
    };

    switch (donations.get(id)) {
      case (null) {
        Runtime.trap("Donation not found");
      };
      case (?donation) {
        if (donation.status != #accepted) {
          Runtime.trap("Only accepted donations can be marked as picked up");
        };
        let currentUser = users.get(caller);
        switch (currentUser) {
          case (null) { Runtime.trap("Could not find user for caller") };
          case (?user) {
            if (user.id == donation.donorId or (donation.acceptedByNgoId != null and user.id == donation.acceptedByNgoId.unwrap())) {
              let updatedDonation : Donation = {
                donation with status = #pickedUp
              };
              donations.add(id, updatedDonation);
            } else {
              Runtime.trap("Only the donor or accepting NGO can mark this donation as picked up");
            };
          };
        };
      };
    };
  };

};
