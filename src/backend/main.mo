import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // COMPONENTS
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
  };

  type Client = {
    name : Text;
    contactNumber : Text;
    location : Text;
    notes : Text;
  };

  type Visit = {
    id : Nat;
    user : Principal;
    clientName : Text;
    contactNumber : Text;
    locationName : Text;
    latitude : Float;
    longitude : Float;
    visitDate : Time.Time;
    notes : Text;
  };

  module Visit {
    public func compareByDate(visit1 : Visit, visit2 : Visit) : Order.Order {
      Nat.compare(visit1.id, visit2.id);
    };
  };

  // Persistent Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let clients = Map.empty<Principal, List.List<Client>>();
  let visits = Map.empty<Principal, List.List<Visit>>();
  var nextVisitId = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Client Management
  public shared ({ caller }) func addClient(client : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only members can add clients!");
    };

    let existingClients = switch (clients.get(caller)) {
      case (null) { List.empty<Client>() };
      case (?clients) { clients };
    };

    existingClients.add(client);
    clients.add(caller, existingClients);
  };

  public query ({ caller }) func getClients() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only members can view clients!");
    };

    switch (clients.get(caller)) {
      case (null) { [] };
      case (?clientList) { clientList.toArray() };
    };
  };

  // Visit Management
  public shared ({ caller }) func createVisit(
    clientName : Text,
    contactNumber : Text,
    locationName : Text,
    latitude : Float,
    longitude : Float,
    visitDate : Time.Time,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only members can create visits!");
    };

    let visit : Visit = {
      id = nextVisitId;
      user = caller;
      clientName;
      contactNumber;
      locationName;
      latitude;
      longitude;
      visitDate;
      notes;
    };

    let userVisits = switch (visits.get(caller)) {
      case (null) { List.empty<Visit>() };
      case (?existingVisits) { existingVisits };
    };

    userVisits.add(visit);
    visits.add(caller, userVisits);

    nextVisitId += 1;
  };

  // Get Visits for Caller
  public query ({ caller }) func getMyVisits() : async [Visit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only members can get their visits!");
    };

    switch (visits.get(caller)) {
      case (null) { [] };
      case (?visitList) {
        visitList.toArray().sort(Visit.compareByDate);
      };
    };
  };

  // Admin: Get All Visits
  public query ({ caller }) func getAllVisits() : async [Visit] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all visits!");
    };

    let allVisits = List.empty<Visit>();

    for ((user, userVisits) in visits.entries()) {
      allVisits.addAll(userVisits.values());
    };

    allVisits.toArray();
  };

  // Get Visits for Specific User (admin only)
  public query ({ caller }) func getVisitsByUser(user : Principal) : async [Visit] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get visits by user!");
    };

    switch (visits.get(user)) {
      case (null) { [] };
      case (?visitList) { visitList.toArray() };
    };
  };
};
