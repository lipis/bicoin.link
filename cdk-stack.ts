#!/usr/bin/env node
import "source-map-support/register";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53_targets from "@aws-cdk/aws-route53-targets";

import env from "./env.deploy.js";

export class CdkStackStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "BicoinDotLinkVpc", { maxAzs: 3 });
    const cluster = new ecs.Cluster(this, "BicoinDotLinkCluster", { vpc });
    const zone = route53.HostedZone.fromLookup(
      this,
      "BicoinDotLinkHostedZone",
      {
        domainName: env.domain,
      }
    );
    const certificate = new acm.Certificate(this, "BicoinDotLinkCertificate", {
      domainName: env.domain,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "BicoinDotLinkWorkerFargateService",
      {
        cluster: cluster,
        cpu: 256,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromAsset("."),
        },
        memoryLimitMiB: 512,
        publicLoadBalancer: true,
        certificate,
        domainName: env.domain,
        domainZone: zone,
      }
    );

    new route53.ARecord(this, "BicoinDotLinkWorkerARecord", {
      zone,
      recordName: env.domain,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(service.loadBalancer)
      ),
    });
  }
}

const app = new cdk.App();
new CdkStackStack(app, "BicoinDotLinkStack", { env });
